"use client";

import { useEffect, useRef } from "react";

type ClippedLoopVideoProps = {
  src: string;
  className?: string;
  startTime?: number;
  endTime?: number;
};

export function ClippedLoopVideo({
  src,
  className,
  startTime = 0,
  endTime = 8,
}: ClippedLoopVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const resetToStart = () => {
      if (video.currentTime >= endTime) {
        video.currentTime = startTime;
        void video.play();
      }
    };

    const startVideo = () => {
      video.currentTime = startTime;
      void video.play();
    };

    video.addEventListener("loadedmetadata", startVideo);
    video.addEventListener("timeupdate", resetToStart);
    video.addEventListener("ended", startVideo);

    return () => {
      video.removeEventListener("loadedmetadata", startVideo);
      video.removeEventListener("timeupdate", resetToStart);
      video.removeEventListener("ended", startVideo);
    };
  }, [endTime, startTime]);

  return (
    <video
      ref={videoRef}
      className={className}
      src={src}
      autoPlay
      muted
      playsInline
      preload="auto"
      aria-hidden="true"
    />
  );
}
