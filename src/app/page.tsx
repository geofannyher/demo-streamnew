"use client";

import { supabase } from "@/lib/supabase";
import React, { useEffect, useRef, useState } from "react";
import { socket } from "@/lib/socket";

const PlayVideo: React.FC = () => {
  const [videoIdle, setVideoIdle] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [idleTimeStart, setIdleTimeStart] = useState(0);
  const [idleTimeEnd, setIdleTimeEnd] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [timeStart, setTimeStart] = useState(0);
  const [timeEnd, setTimeEnd] = useState(0);
  const [modelStream, setModelStream] = useState("");
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isOnlyAudio, setIsOnlyAudio] = useState(false);
  const fetchDataModel = async () => {
    try {
      const { data, error } = await supabase.from("model").select("*");
      if (error) throw error;

      if (data && data.length > 0) {
        const modelIdle = localStorage.getItem("modelstream");
        const models = data.find((item) => item.model_name === modelIdle);

        if (models && modelIdle === "kokovin") {
          setModelStream(models.video_url);
          setIdleTimeStart(Number(models.time_start));
          setIdleTimeEnd(Number(models.time_end));
        } else if (models && modelIdle === "cinda") {
          setModelStream(models.video_url);
          setIdleTimeStart(Number(models.time_start));
          setIdleTimeEnd(Number(models.time_end));
        } else if (models && modelIdle === "nyiroro") {
          setModelStream(models.video_url);
          setIdleTimeStart(Number(models.time_start));
          setIdleTimeEnd(Number(models.time_end));
        } else if (models && modelIdle === "naura") {
          setModelStream(models.video_url);
          setIdleTimeStart(Number(models.time_start));
          setIdleTimeEnd(Number(models.time_end));
        }
      }
    } catch (error) {
      console.error("Error fetching data from Supabase:", error);
    }
  };

  useEffect(() => {
    fetchDataModel();
  }, []);

  useEffect(() => {
    const modelIdle = localStorage.getItem("modelstream");
    console.log(modelStream, "model");
    if (modelIdle === "kokovin" && modelStream) {
      setVideoIdle(modelStream);
    } else if (modelIdle === "cinda" && modelStream) {
      setVideoIdle(modelStream);
    } else if (modelIdle === "nyiroro" && modelStream) {
      setVideoIdle(modelStream);
    } else if (modelIdle === "naura" && modelStream) {
      setVideoIdle(modelStream);
    }
  }, [modelStream]);

  const playIdleVideo = () => {
    if (videoRef.current && !isAudioPlaying) {
      videoRef.current.currentTime = idleTimeStart;
      videoRef.current.play().catch((error) => {
        console.error("Error playing video:", error);
      });
    }
  };

  useEffect(() => {
    const handleReceiveMessage = ({
      audio_url,
      time_start,
      time_end,
    }: {
      audio_url: string;
      time_start: number;
      time_end: number;
    }) => {
      if (audio_url) {
        if (audio_url === "only") {
          console.log("on");
          setIsOnlyAudio(true);
          setTimeStart(time_start);
          setTimeEnd(time_end);
          setAudioUrl(audio_url);
        } else {
          setIsOnlyAudio(false);
          setTimeStart(time_start);
          setTimeEnd(time_end);
          setAudioUrl(audio_url);
        }
      }
    };

    socket.on("receive_message", handleReceiveMessage);
    return () => {
      socket.off("receive_message", handleReceiveMessage);
    };
  }, []);

  useEffect(() => {
    console.log(isOnlyAudio, audioUrl, "cek");
    if (audioUrl && audioUrl !== "only" && videoRef.current) {
      setIsAudioPlaying(true);
      videoRef.current.currentTime = timeStart; // Set the video start time
      videoRef.current.play().catch((error) => {
        console.error("Error playing video:", error);
      });

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.load();
        audioRef.current.play().catch((error) => {
          console.error("Error playing audio:", error);
        });
      }
    } else if (isOnlyAudio && audioUrl === "only") {
      // Handle "only" case, start video without audio
      console.log("play lah boi");
      if (videoRef.current) {
        videoRef.current.currentTime = timeStart;
        videoRef.current.muted = false; // Unmute video
        videoRef.current.play().catch((error) => {
          console.error("Error playing video:", error);
        });
      }
    } else {
      setIsAudioPlaying(false);
    }
  }, [audioUrl]);

  const handleAudioEnded = () => {
    setAudioUrl("");
    setIsAudioPlaying(false);
    playIdleVideo();
    socket.emit("audio_finished");
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      if (
        audioUrl &&
        audioUrl !== "only" &&
        videoRef.current.currentTime >= timeEnd
      ) {
        videoRef.current.currentTime = timeStart;
        videoRef.current.play().catch((error) => {
          console.error("gagal play saat ada audio", error);
        });
      } else if (
        isOnlyAudio &&
        audioUrl == "only" &&
        videoRef.current.currentTime >= timeEnd
      ) {
        videoRef.current.currentTime = idleTimeStart;
        videoRef.current.muted = true;
        videoRef.current
          .play()
          .catch((error) => {
            console.error("gagal play setelah hanya video", error);
          })
          .finally(() => {
            socket.emit("audio_finished");
            setIsOnlyAudio(false);
            setAudioUrl("");
          });
      } else if (!audioUrl && videoRef.current.currentTime >= idleTimeEnd) {
        videoRef.current.currentTime = idleTimeStart;
        videoRef.current.play().catch((error) => {
          console.error("gagal play saat video kembali ke idle", error);
        });
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
                  onTimeUpdate={handleTimeUpdate}
                  autoPlay
                  muted
                  // controls
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
      {audioUrl && audioUrl !== "only" && (
        <audio ref={audioRef} onEnded={handleAudioEnded} autoPlay controls>
          <source src={audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
};

export default PlayVideo;
