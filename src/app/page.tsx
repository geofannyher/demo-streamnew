"use client";
import { socket } from "@/lib/socket";
import { supabase } from "@/lib/supabase";
import React, { useRef, useState, useEffect } from "react";
import ReactPlayer from "react-player";

const VideoPlayer = () => {
  const videoRef = useRef<ReactPlayer>(null);
  const [videoIdle, setVideoIdle] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [idleTimeStart, setIdleTimeStart] = useState(0);
  const [idleTimeEnd, setIdleTimeEnd] = useState(10);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [timeStart, setTimeStart] = useState(0);
  const [timeEnd, setTimeEnd] = useState(0);
  const [modelStream, setModelStream] = useState("");
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isOnlyAudio, setIsOnlyAudio] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
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

  const playIdleVideo = () => {
    if (videoRef.current && !isAudioPlaying) {
      videoRef.current.seekTo(idleTimeStart);
    }
  };

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

  useEffect(() => {
    fetchDataModel();
  }, []);

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
        console.log(audio_url);
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
      videoRef.current.seekTo(timeStart); // Set the video start time

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
        videoRef.current.seekTo(timeStart);
        setIsMuted(false);
      }
    } else {
      setIsAudioPlaying(false);
    }
  }, [audioUrl]);

  const handleProgress = (item: any) => {
    if (videoRef && videoRef.current) {
      if (audioUrl && audioUrl !== "only" && item?.playedSeconds >= timeEnd) {
        videoRef.current.seekTo(0);
      } else if (
        isOnlyAudio &&
        audioUrl == "only" &&
        item?.playedSeconds >= timeEnd
      ) {
        videoRef.current.seekTo(idleTimeStart);
        socket.emit("audio_finished");
        setIsMuted(true);
        setAudioUrl("");
      } else if (!audioUrl && item?.playedSeconds >= idleTimeEnd) {
        videoRef.current.seekTo(idleTimeStart);
      }
    }
  };

  const handleAudioEnded = () => {
    setAudioUrl("");
    playIdleVideo();
    setIsAudioPlaying(false);
    socket.emit("audio_finished");
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
                <ReactPlayer
                  ref={videoRef}
                  url={videoIdle}
                  controls
                  playing={true}
                  onProgress={handleProgress}
                  height={896}
                  width={414}
                  muted={isMuted}
                />
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

export default VideoPlayer;
