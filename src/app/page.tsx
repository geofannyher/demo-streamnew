"use client";

import { socket } from "@/lib/socket";
import { supabase } from "@/lib/supabase";
import React, { useEffect, useRef, useState } from "react";

const PlayVideo: React.FC = () => {
  const [videoIdle, setVideoIdle] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeStart, setTimeStart] = useState(0);
  const [idleTimeStart, setIdleTimeStart] = useState(0);
  const [idleTimeEnd, setIdleTimeEnd] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [miraIdle, setMiraIdle] = useState("");

  const fetchDataModel = async () => {
    try {
      const { data, error } = await supabase.from("model").select("*");
      if (error) throw error;

      if (data && data.length > 0) {
        const mira = data.find((item) => item.model_name === "kokovin");
        const modelIdle = localStorage.getItem("modelstream");

        const setIdleData = (model: any) => {
          setIdleTimeStart(Number(model.time_start));
          setIdleTimeEnd(Number(model.time_end));
        };

        if (mira && modelIdle === "kokovin") {
          setMiraIdle(mira.video_url);
          setIdleData(mira);
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
    if (modelIdle === "kokovin" && miraIdle) {
      setVideoIdle(miraIdle);
      setTimeStart(idleTimeStart);
      setIdleTimeEnd(idleTimeEnd);
    } else {
      setVideoIdle("");
    }
  }, [miraIdle, idleTimeStart, idleTimeEnd]);

  useEffect(() => {
    socket.on("receive_message", ({ audio_url, time_start, time_end }) => {
      if (!audio_url && videoRef.current) {
        console.log(time_start, time_end);
        // Jika audio_url null, tetapi time_start dan time_end ada
        videoRef.current.currentTime = time_start;
        videoRef.current.muted = false; // Aktifkan audio
        videoRef.current.play();

        const handleMuteAfterPlaying = () => {
          if (videoRef.current && videoRef.current.currentTime >= time_end) {
            videoRef.current.pause();
            videoRef.current.muted = true; // Mute kembali setelah selesai
            videoRef.current.currentTime = idleTimeStart;
            videoRef.current.loop = true; // Aktifkan loop untuk mode idle
            videoRef.current.play();
            videoRef.current.removeEventListener(
              "timeupdate",
              handleMuteAfterPlaying
            );
            // Kirim sinyal ke backend bahwa video telah selesai diputar
            socket.emit("audio_finished");
          }
        };

        videoRef.current.addEventListener("timeupdate", handleMuteAfterPlaying);
      } else if (audio_url) {
        setAudioUrl(audio_url);
        setTimeStart(time_start);
        setIdleTimeEnd(time_end);
        setIsPlaying(true);
        if (videoRef.current) {
          videoRef.current.currentTime = time_start;
          videoRef.current.loop = false; // Nonaktifkan loop untuk mode khusus
          videoRef.current.play();
        }
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [idleTimeStart]);
  console.log("x");
  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      audioRef.current.volume = 0.2;
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }
  }, [audioUrl]);

  const handleAudioEnded = () => {
    console.log("Audio ended");
    setIsPlaying(false);
    setTimeStart(idleTimeStart);
    setIdleTimeEnd(idleTimeEnd);
    if (videoRef.current) {
      videoRef.current.currentTime = idleTimeStart;
    }
    socket.emit("audio_finished");
  };

  const handleTimeUpdate = () => {
    if (videoRef.current && videoRef.current.currentTime >= idleTimeEnd) {
      videoRef.current.currentTime = timeStart;
      videoRef.current.play();
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
