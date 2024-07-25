"use client";

import { socket } from "@/lib/socket";
import { supabase } from "@/lib/supabase";
import React, { useEffect, useRef, useState } from "react";

const PlayVideo: React.FC = () => {
  const [videoIdle, setVideoIdle] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeStart, setTimeStart] = useState(0);
  const [timeEnd, setTimeEnd] = useState(0);
  const [idleTimeStart, setIdleTimeStart] = useState(0);
  const [idleTimeEnd, setIdleTimeEnd] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [miraIdle, setMiraIdle] = useState("");
  const [gembulIdle, setGembulIdle] = useState("");

  const fetchDataModel = async () => {
    const { data, error } = await supabase.from("model").select("*");
    if (error) {
      console.error("Error fetching data from Supabase:", error);
    } else if (data && data.length > 0) {
      const mira = data.find((item) => item.model_name === "mira");
      const gembul = data.find((item) => item.model_name === "gembul");
      const modelIdle = localStorage.getItem("modelstream");

      if (mira && modelIdle === "mira") {
        setMiraIdle(mira.video_url);
        setIdleTimeStart(mira.time_start ? mira.time_start : 0);
        setIdleTimeEnd(mira.time_end ? mira.time_end : 10);
      }
      if (gembul && modelIdle === "gembul") {
        setGembulIdle(gembul.video_url);
        setIdleTimeStart(gembul.time_start ? mira.time_start : 0);
        setIdleTimeEnd(gembul.time_end ? mira.time_end : 10);
      }
    }
  };

  useEffect(() => {
    fetchDataModel();
  }, []);

  useEffect(() => {
    const modelIdle = localStorage.getItem("modelstream");
    if (modelIdle === "mira" && miraIdle) {
      setVideoIdle(miraIdle);
      setTimeStart(idleTimeStart);
      setTimeEnd(idleTimeEnd);
    } else if (modelIdle === "gembul" && gembulIdle) {
      setVideoIdle(gembulIdle);
      setTimeStart(idleTimeStart);
      setTimeEnd(idleTimeEnd);
    } else {
      setVideoIdle("");
    }
  }, [miraIdle, gembulIdle, idleTimeStart, idleTimeEnd]);

  useEffect(() => {
    socket.on("receive_message", ({ audio_url, time_start, time_end }) => {
      setAudioUrl(audio_url);
      setTimeStart(time_start);
      setTimeEnd(time_end);
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.currentTime = time_start;
        videoRef.current.play();
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
    setTimeStart(idleTimeStart);
    setTimeEnd(idleTimeEnd);
    if (videoRef.current) {
      videoRef.current.currentTime = idleTimeStart;
    }
    socket.emit("audio_finished");
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      if (videoRef.current.currentTime >= timeEnd) {
        videoRef.current.currentTime = timeStart;
        videoRef.current.play();
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = timeStart;
      if (isPlaying) {
        videoRef.current.play();
      }
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
                  controls
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
