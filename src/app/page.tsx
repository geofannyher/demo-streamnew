"use client";

import { socket } from "@/lib/socket";
import React, { useEffect, useRef, useState } from "react";

const PlayVideo: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState("");
  const [videoIdle, setVideoIdle] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const buriniIdle =
    "https://res.cloudinary.com/dp8ita8x5/video/upload/v1719311476/videoStream/new/lhd7y8lzdevwrke6fxyg.mp4";
  const gembulIdle =
    "https://res.cloudinary.com/dp8ita8x5/video/upload/v1720685155/videoStream/gemuk/wpoydfqeewnhdvtr9mog.mp4";

  console.log(videoUrl, audioUrl);
  useEffect(() => {
    const modelIdle = localStorage.getItem("modelstream");
    if (modelIdle === "burini") {
      setVideoIdle(buriniIdle);
    } else if (modelIdle === "gembul") {
      setVideoIdle(gembulIdle);
    } else {
      setVideoIdle("");
    }
  }, []);

  useEffect(() => {
    socket.on("receive_message", ({ audio_url, video_url }) => {
      setVideoUrl(video_url);
      setAudioUrl(audio_url);
    });

    return () => {
      socket.off("receive_message");
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      if (audioRef.current && audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.load();
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error);
        });
      }

      if (videoRef.current && audioUrl) {
        videoRef.current.currentTime = 10;
      }
    }
  }, [audioUrl, isPlaying]);

  const handleAudioEnded = () => {
    console.log("Audio ended");
    setAudioUrl("");
    setVideoUrl("");
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      if (audioUrl && videoRef.current.currentTime >= 20) {
        videoRef.current.currentTime = 10; // Loop from 10 to 20 seconds
      } else if (!audioUrl && videoRef.current.currentTime >= 9) {
        videoRef.current.currentTime = 0; // Loop from 0 to 9 seconds
      }
    }
  };

  const handleStart = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.error("Error playing video:", error);
      });
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
                  src={videoUrl ? videoUrl : videoIdle}
                >
                  <source
                    src={videoUrl ? videoUrl : videoIdle}
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        </div>
      </div>
      {audioUrl && (
        <audio
          ref={audioRef}
          onEnded={handleAudioEnded}
          autoPlay
          controls
          // style={{ display: "none" }}
        >
          <source src={audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
};

export default PlayVideo;
