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
  const [currentVideoUrl, setCurrentVideoUrl] = useState("");
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [miraIdle, setMiraIdle] = useState("");
  const [gembulIdle, setGembulIdle] = useState("");

  console.log("miraIdle", miraIdle);
  // List of Cloudinary audio URLs for idle state
  const idleAudios = [
    "https://res.cloudinary.com/dp8ita8x5/video/upload/v1723623433/videoStream/testMira/baju.mp3",
    "https://res.cloudinary.com/dp8ita8x5/video/upload/v1723623500/videoStream/testMira/cowok%20casual.mp3",
    "https://res.cloudinary.com/dp8ita8x5/video/upload/v1723603440/videoStream/testMira/nryo2wwxe3r8jwnfajr3.mp3",
    "https://res.cloudinary.com/dp8ita8x5/video/upload/v1723603440/videoStream/testMira/qvycdi25kykbzqlddbrb.mp3",
  ];

  const fetchDataModel = async () => {
    try {
      const { data, error } = await supabase.from("model").select("*");
      if (error) throw error;

      if (data && data.length > 0) {
        const mira = data.find((item) => item.model_name === "mira");
        const gembul = data.find((item) => item.model_name === "gembul");
        const modelIdle = localStorage.getItem("modelstream");

        const setIdleData = (model: any) => {
          setIdleTimeStart(model.time_start || 0);
          setIdleTimeEnd(model.time_end || 10);
        };

        if (mira && modelIdle === "mira") {
          setMiraIdle(mira.video_url);
          setIdleData(mira);
        }
        if (gembul && modelIdle === "gembul") {
          setGembulIdle(gembul.video_url);
          setIdleData(gembul);
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
    if (modelIdle === "mira" && miraIdle) {
      setVideoIdle(miraIdle);
      setTimeStart(idleTimeStart);
      setIdleTimeEnd(idleTimeEnd);
    } else if (modelIdle === "gembul" && gembulIdle) {
      setVideoIdle(gembulIdle);
      setTimeStart(idleTimeStart);
      setIdleTimeEnd(idleTimeEnd);
    } else {
      setVideoIdle("");
    }
  }, [miraIdle, gembulIdle, idleTimeStart, idleTimeEnd]);

  useEffect(() => {
    setAudioUrl(idleAudios[Math.floor(Math.random() * idleAudios.length)]);
  }, []);

  useEffect(() => {
    socket.on(
      "receive_message",
      ({ video_url, audio_url, time_start, time_end }) => {
        if (video_url) {
          setCurrentVideoUrl(video_url);
          setIsPlaying(true);
          if (videoRef.current) {
            videoRef.current.src = video_url;
            videoRef.current.currentTime = time_start;
            videoRef.current.muted = false;
            videoRef.current
              .play()
              .catch((error) =>
                console.error("Error auto-playing video:", error)
              );
          }
        } else {
          setAudioUrl(
            audio_url ||
              idleAudios[Math.floor(Math.random() * idleAudios.length)]
          );
          setTimeStart(time_start);
          setIdleTimeEnd(time_end);
          setIsPlaying(true);
          if (videoRef.current) {
            videoRef.current.currentTime = time_start;
            videoRef.current.play();
          }
        }
      }
    );

    return () => {
      socket.off("receive_message");
    };
  }, []);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
      audioRef.current.volume = 0.01;
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
      });

      audioRef.current.loop = idleAudios.includes(audioUrl);
    }
  }, [audioUrl]);
  const handleAudioEnded = () => {
    console.log("Audio ended");
    setIsPlaying(false);
    setTimeStart(idleTimeStart);
    setIdleTimeEnd(idleTimeEnd);
    setAudioUrl(idleAudios[Math.floor(Math.random() * idleAudios.length)]);
    if (videoRef.current) {
      videoRef.current.currentTime = idleTimeStart;
    }
    socket.emit("audio_finished");
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      if (
        currentVideoUrl &&
        videoRef.current.currentTime >= videoRef.current.duration
      ) {
        // Stop the video if it's the one-time video
        videoRef.current.pause();
        videoRef.current.currentTime = idleTimeStart;
        socket.emit("audio_finished");
        handleVideoEnded();
      } else if (
        !currentVideoUrl &&
        videoRef.current.currentTime >= idleTimeEnd
      ) {
        // Loop the video if it's the idle video
        videoRef.current.currentTime = timeStart;
        videoRef.current.play();
      }
    }
  };

  const handleVideoEnded = () => {
    if (currentVideoUrl) {
      setCurrentVideoUrl("");
      if (videoRef.current) {
        videoRef.current.src = videoIdle;
        videoRef.current.currentTime = idleTimeStart;
        videoRef.current.muted = true;
        videoRef.current
          .play()
          .catch((error) => console.error("Error auto-playing video:", error));
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
  console.log(currentVideoUrl);
  console.log(videoIdle);

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
                  // autoPlay
                  controls
                  muted={!currentVideoUrl}
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={handleVideoEnded}
                  src={currentVideoUrl || videoIdle}
                >
                  <source src={currentVideoUrl || videoIdle} type="video/mp4" />
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
          aria-valuenow={2}
          onEnded={handleAudioEnded}
          autoPlay
          muted={currentVideoUrl !== ""}
          controls
        >
          <source src={audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
};

export default PlayVideo;
