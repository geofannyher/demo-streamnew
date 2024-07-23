"use client";

import { socket } from "@/lib/socket";
import React, { useEffect, useRef, useState } from "react";

const PlayVideo: React.FC = () => {
  const [videoIdle, setVideoIdle] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeStart, setTimeStart] = useState(0);
  const [timeEnd, setTimeEnd] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const miraIdle =
    "https://res.cloudinary.com/dp8ita8x5/video/upload/v1721710825/uploads/zv5srxv2dlidtcie0min.mp4";
  const gembulIdle =
    "https://res.cloudinary.com/dp8ita8x5/video/upload/v1720685155/videoStream/gemuk/wpoydfqeewnhdvtr9mog.mp4";

  useEffect(() => {
    const modelIdle = localStorage.getItem("modelstream");
    if (modelIdle === "mira") {
      setVideoIdle(miraIdle);
      setTimeStart(23);
      setTimeEnd(24);
    } else if (modelIdle === "gembul") {
      setVideoIdle(gembulIdle);
      setTimeStart(0);
      setTimeEnd(10);
    } else {
      setVideoIdle("");
    }
  }, []);

  useEffect(() => {
    socket.on("receive_message", ({ audio_url, time_start, time_end }) => {
      setAudioUrl(audio_url);
      setTimeStart(time_start);
      setTimeEnd(time_end);
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.currentTime = time_start;
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  useEffect(() => {
    if (audioUrl) {
      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.load();
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error);
        });
      }
    }
  }, [audioUrl]);

  const handleAudioEnded = () => {
    console.log("Audio ended");
    setAudioUrl("");
    setIsPlaying(false);
    setTimeStart(23);
    setTimeEnd(24);
    if (videoRef.current) {
      videoRef.current.currentTime = 23; // Reset video to start
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      if (videoRef.current.currentTime >= timeEnd) {
        videoRef.current.currentTime = timeStart;
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = isPlaying ? timeStart : 23;
    }
  };

  return (
    <div className="grid grid-cols-3 h-[100dvh]">
      <div className="col-span-3 flex items-center justify-center bg-white h-full">
        <div
          style={{
            width: "calc(100dvh * 9 / 16)",
          }}
          className="relative bg-white flex items-center justify-center"
        >
          <div className="flex h-full flex-col items-center justify-center">
            <div className="relative">
              {videoIdle && (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  src={videoIdle}
                >
                  <source src={videoIdle} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        </div>
      </div>
      {audioUrl && (
        <audio ref={audioRef} onEnded={handleAudioEnded} autoPlay controls>
          <source src={audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
};

export default PlayVideo;
