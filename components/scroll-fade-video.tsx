"use client";

import { useEffect, useRef } from "react";

type ScrollFadeVideoProps = {
  src: string;
  className?: string;
  label: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function ScrollFadeVideo({ src, className, label }: ScrollFadeVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let frame = 0;

    const updateVolume = () => {
      frame = 0;
      const rect = video.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = viewportHeight / 2;
      const distance = Math.abs(elementCenter - viewportCenter);
      const fadeRange = viewportHeight * 0.68;
      const visibility = rect.bottom > 0 && rect.top < viewportHeight ? 1 : 0;
      const volume = visibility * clamp(1 - distance / fadeRange, 0, 1);

      video.volume = volume;
      video.muted = volume < 0.03;

      if (volume > 0.03 && video.paused) {
        video.play().catch(() => {
          video.muted = true;
          video.play().catch(() => {});
        });
      }
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateVolume);
    };

    updateVolume();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      className={className}
      src={src}
      aria-label={label}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
    />
  );
}
