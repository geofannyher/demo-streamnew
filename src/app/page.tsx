"use client";
import { socket } from "@/lib/socket";
import { supabase } from "@/lib/supabase";
import { Action } from "@/shared/Url.interface";
import dechroma from "dechroma";
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
  const [displayChroma, setDisplayChroma] = useState(false);

  const fetchDataModel = async () => {
    const modelIdle = localStorage.getItem("modelstream");
    try {
      const { data, error } = await supabase.from("action").select(`
          model_name,
          time_start,time_end,action_name,
          model (
            video_url
          )
        `);
      const url: Action[] = data?.filter(
        (a) => a?.model_name == modelIdle && a.action_name == "idle"
      ) as any;

      if (error) throw error;

      if (data && url) {
        // const models = data.find((item) => item.model_name === modelIdle);

        // if (models) {
        setModelStream(url[0].model?.video_url);
        setIdleTimeStart(Number(url[0].time_start));
        setIdleTimeEnd(Number(url[0].time_end));
        // }
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

    if (modelIdle && modelStream) {
      setVideoIdle(modelStream);
    }
  }, [modelStream]);

  useEffect(() => {
    setTimeout(() => {
      setDisplayChroma(true);

      const videoo: HTMLElement | null = document.querySelector("#test");
      console.log(videoo);
      if (videoo) {
        const inVideo: HTMLVideoElement | null = videoo?.querySelector(
          "video"
        ) as HTMLVideoElement;
        const ccanvas: HTMLCanvasElement | null = document.querySelector(
          "canvas"
        ) as HTMLCanvasElement;

        if (ccanvas && inVideo) {
          ccanvas.setAttribute("height", window.innerHeight as any);
          ccanvas.setAttribute("width", "550px");

          const ctx: CanvasRenderingContext2D | null = ccanvas.getContext(
            "2d",
            {
              willReadFrequently: true,
            }
          );

          const drawvid = () => {
            if (ctx) {
              ctx.clearRect(0, 0, ccanvas?.width, ccanvas?.height);

              // Gambar frame dari video ke canvas
              ctx.drawImage(inVideo, 0, 0, ccanvas?.width, ccanvas?.height);

              // Ambil data gambar dari canvas
              const frame: ImageData = ctx.getImageData(
                0,
                0,
                ccanvas?.width,
                ccanvas?.height
              );

              dechroma(frame, [0, 100], [145, 255], [0, 110]);

              ctx.putImageData(frame, 0, 0);
            }
            requestAnimationFrame(drawvid);
          };
          inVideo?.addEventListener("play", drawvid);
        }
      }
    }, 3000);

    fetchDataModel();
    setAudioUrl(
      "https://res.cloudinary.com/dcd1jeldi/video/upload/v1727774746/h9fqhyiwmx5hu7v5h3r3.mp3"
    );
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
  }, [isOnlyAudio, timeStart, audioUrl]);

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
    <div className="h-[100dvh] flex flex-col">
      {/* Flex Container for Videos */}
      {/* Left Side for Video */}
      <div className="flex-1 flex">
        <div className="flex-1 flex items-center justify-center">
          <div className="relative">
            {videoIdle && (
              <ReactPlayer
                id="test"
                ref={videoRef}
                url={videoIdle}
                playing={true}
                controls
                onProgress={handleProgress}
                height="100dvh" // Set tinggi penuh
                muted={isMuted}
                config={{
                  file: { attributes: { crossOrigin: "anonymous" } },
                }}
              />
            )}
          </div>
        </div>

        {/* Right Side for Audio Controls */}
        {displayChroma && (
          <div className="flex-1 flex items-center relative justify-center">
            <div className="absolute right-0 top-0 z-10">
              <img
                src="https://images.pexels.com/photos/4352247/pexels-photo-4352247.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                alt="daun"
                className="h-[100dvh] w-[550px]"
              />
            </div>

            <canvas className="absolute right-0 top-0 z-20"></canvas>
          </div>
        )}
      </div>

      {/* Audio Element */}
      {audioUrl && audioUrl !== "only" && (
        <div className="flex justify-center p-4">
          <audio ref={audioRef} onEnded={handleAudioEnded} autoPlay controls>
            <source src={audioUrl} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
