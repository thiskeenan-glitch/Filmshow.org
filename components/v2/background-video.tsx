"use client";

import { useEffect, useRef, useState } from "react";

type BackgroundVideoProps = {
  src: string;
  mobileSrc?: string;
  className: string;
  poster?: string;
};

export function BackgroundVideo({ src, mobileSrc, className, poster }: BackgroundVideoProps) {
  const [needsPlay, setNeedsPlay] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const viewport = window.matchMedia("(max-width: 760px)");
    let visible = false;
    let disposed = false;
    const play = () => {
      if (disposed || !visible || document.hidden) return;
      // Set both the DOM property and attribute before loading for Safari autoplay.
      video.defaultMuted = true;
      video.muted = true;
      video.setAttribute("muted", "");
      if (!video.paused) return;
      video.play().then(() => {
        if (!disposed) setNeedsPlay(false);
      }).catch((error: DOMException) => {
        if (!disposed && visible && error.name !== "AbortError") setNeedsPlay(true);
      });
    };
    const updateSource = () => {
      video.defaultMuted = true;
      video.muted = true;
      video.setAttribute("muted", "");
      const next = viewport.matches && mobileSrc ? mobileSrc : src;
      if (video.getAttribute("src") !== next) {
        video.src = next;
        video.load();
      }
      play();
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) play();
      else video.pause();
    });
    observer.observe(video);
    // Safari can suspend a video without a new intersection event.
    const retry = window.setInterval(play, 2000);
    const playing = () => setNeedsPlay(false);
    video.addEventListener("playing", playing);
    document.addEventListener("click", play);
    window.addEventListener("pageshow", play);
    video.addEventListener("canplay", play);
    video.addEventListener("loadeddata", play);
    video.addEventListener("ended", play);
    document.addEventListener("visibilitychange", play);
    document.addEventListener("pointerdown", play);
    document.addEventListener("touchend", play);
    viewport.addEventListener("change", updateSource);
    updateSource();
    return () => {
      disposed = true;
      observer.disconnect();
      window.clearInterval(retry);
      video.removeEventListener("playing", playing);
      document.removeEventListener("click", play);
      window.removeEventListener("pageshow", play);
      video.pause();
      video.removeEventListener("canplay", play);
      video.removeEventListener("loadeddata", play);
      video.removeEventListener("ended", play);
      document.removeEventListener("visibilitychange", play);
      document.removeEventListener("pointerdown", play);
      document.removeEventListener("touchend", play);
      viewport.removeEventListener("change", updateSource);
    };
  }, [src, mobileSrc]);

  return <>
    <video src={src} ref={videoRef} className={className} poster={poster} autoPlay muted loop playsInline preload="auto" controls={false} disablePictureInPicture aria-hidden="true" tabIndex={-1} />
    {needsPlay && <button type="button" className="v2-video-play" onClick={() => {
      const video = videoRef.current;
      if (!video) return;
      video.muted = true;
      void video.play().then(() => setNeedsPlay(false)).catch(() => setNeedsPlay(true));
    }}>Play video <span aria-hidden="true">▶</span></button>}
  </>;
}
