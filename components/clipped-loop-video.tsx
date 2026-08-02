"use client";

import { useEffect, useRef } from "react";

type ClippedLoopVideoProps = {
  src: string;
  className?: string;
  endTime?: number;
};

export function ClippedLoopVideo({
  src,
  className,
  endTime = 8,
}: ClippedLoopVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const resetToStart = () => {
      if (video.currentTime >= endTime) {
        video.currentTime = 0;
        void video.play();
      }
    };

    const startVideo = () => {
      video.currentTime = 0;
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
  }, [endTime]);

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
