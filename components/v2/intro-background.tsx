"use client";

import { useEffect, useRef } from "react";

export function IntroBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const viewport = window.matchMedia("(max-width: 760px)");
    const updateSource = () => {
      const video = videoRef.current;
      if (!video) return;
      video.src = viewport.matches
        ? "/videos/intro-mobile.mov"
        : "/videos/website-stage-background.mp4";
      video.muted = true;
      video.load();
      video.play().catch(() => undefined);
    };
    updateSource();
    viewport.addEventListener("change", updateSource);
    return () => viewport.removeEventListener("change", updateSource);
  }, []);

  return <video ref={videoRef} className="v2-intro__background" autoPlay muted loop playsInline preload="metadata" aria-hidden="true" tabIndex={-1} />;
}
