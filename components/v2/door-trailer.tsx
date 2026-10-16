"use client";

import { ArrowIcon } from "@/components/arrow-icon";

import { useCallback, useEffect, useRef, useState } from "react";

export function DoorTrailer() {
  const [isOpen, setIsOpen] = useState(false);
  const [needsPlay, setNeedsPlay] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollBlockedUntil = useRef(0);
  const soundAllowed = useRef(true);
  const userMuted = useRef(false);

  const playTrailer = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = userMuted.current || !soundAllowed.current;
    video.play().catch((error: DOMException) => {
      if (error.name === "AbortError") return;
      soundAllowed.current = false;
      video.muted = true;
      video.play().catch((error: DOMException) => {
        if (error.name !== "AbortError") setNeedsPlay(true);
      });
    });
  }, []);

  const openWithSound = useCallback(() => {
    userMuted.current = false;
    soundAllowed.current = true;
    if (videoRef.current) videoRef.current.volume = 1;
    setIsOpen(true);
    // Start inside the opening gesture so browsers can allow audio.
    playTrailer();
  }, [playTrailer]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const viewport = window.matchMedia("(max-width: 760px)");
    const updateSource = () => {
      const src = viewport.matches
        ? "/videos/filmshow-mobile-hero.mp4"
        : "/videos/filmshow-v1-recap.mp4";
      video.poster = viewport.matches
        ? "/images/v2/mobile-hero-poster.jpg"
        : "/images/v2/v1-screen.jpg";
      if (video.getAttribute("src") !== src) {
        video.src = src;
        video.load();
      }
    };
    updateSource();
    viewport.addEventListener("change", updateSource);
    return () => viewport.removeEventListener("change", updateSource);
  }, []);

  useEffect(() => {
    const openTrailer = () => {
      if (/^#trailer(?:$|#|%23)/i.test(window.location.hash)) openWithSound();
    };
    const onHomeClick = (event: MouseEvent) => {
      const link = (event.target as Element)?.closest("a");
      if (!link) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin === window.location.origin && (url.pathname === "/" || url.pathname === "/v2") && url.hash === "#trailer") {
        openWithSound();
      }
    };
    openTrailer();
    window.addEventListener("hashchange", openTrailer);
    document.addEventListener("click", onHomeClick);
    return () => {
      window.removeEventListener("hashchange", openTrailer);
      document.removeEventListener("click", onHomeClick);
    };
  }, [openWithSound]);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !isOpen) return;
    const observer = new IntersectionObserver(([entry]) => {
      document.documentElement.classList.toggle("v2-recap-visible", entry.isIntersecting);
      const video = videoRef.current;
      if (!video) return;
      if (entry.isIntersecting) playTrailer();
      else video.pause();
    });
    observer.observe(section);
    return () => {
      observer.disconnect();
      document.documentElement.classList.remove("v2-recap-visible");
    };
  }, [isOpen, playTrailer]);

  useEffect(() => {
    let touchY: number | null = null;
    const openFromScroll = (event: Event, delta: number) => {
      const top = sectionRef.current?.getBoundingClientRect().top;
      if (top === undefined || Math.abs(top) > 2) return;
      if (performance.now() < scrollBlockedUntil.current) {
        event.preventDefault();
        return;
      }
      if (!isOpen && delta > 0) {
        event.preventDefault();
        scrollBlockedUntil.current = performance.now() + 1400;
        openWithSound();
      }
    };
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) openFromScroll(event, event.deltaY);
    };
    const onTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (event: TouchEvent) => {
      if (touchY === null || event.touches.length !== 1) return;
      openFromScroll(event, touchY - event.touches[0].clientY);
    };
    const onScrollKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest("input, textarea, select, button, a, video, [contenteditable]")) return;
      if (["ArrowDown", "PageDown", " "].includes(event.key)) openFromScroll(event, 1);
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onScrollKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onScrollKey);
    };
  }, [isOpen, openWithSound]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!isOpen) {
      video.pause();
      return;
    }
    playTrailer();
    const resume = () => {
      const rect = sectionRef.current?.getBoundingClientRect();
      if (!document.hidden && rect && rect.bottom > 0 && rect.top < window.innerHeight) playTrailer();
    };
    const retry = window.setInterval(() => { if (video.paused) resume(); }, 2000);
    document.addEventListener("visibilitychange", resume);
    document.addEventListener("click", resume);
    window.addEventListener("pageshow", resume);
    return () => {
      window.clearInterval(retry);
      document.removeEventListener("visibilitychange", resume);
      document.removeEventListener("click", resume);
      window.removeEventListener("pageshow", resume);
    };
  }, [isOpen, playTrailer]);

  const enableSound = () => {
    const video = videoRef.current;
    if (!video || !isOpen || userMuted.current) return;
    soundAllowed.current = true;
    video.volume = 1;
    video.muted = false;
    playTrailer();
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <section id="trailer" ref={sectionRef} className={`v2-doors ${isOpen ? "is-open" : ""}`} aria-label="Filmshow trailer">
      <div className="v2-doors__trailer">
        <video
          ref={videoRef}
          loop
          playsInline
          preload="auto"
          muted
          poster="/images/v2/v1-screen.jpg"
          onPlaying={() => setNeedsPlay(false)}
          onCanPlay={() => { if (isOpen) playTrailer(); }}
          onClick={enableSound}
          onVolumeChange={(event) => setIsMuted(event.currentTarget.muted)}
          tabIndex={isOpen ? 0 : -1}
          aria-label="Filmshow Volume 1 recap. Click or press Enter to enable sound."
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              enableSound();
            }
          }}
        >
          <source media="(max-width: 760px)" src="/videos/filmshow-mobile-hero.mp4" type="video/mp4" />
          <source src="/videos/filmshow-v1-recap.mp4" type="video/mp4" />
        </video>
        <div className="v2-doors__trailer-label">
          <span>Volume 1 recap</span>
          <span>Brooklyn · 2026</span>
        </div>
      </div>

      <div className="v2-door v2-door--film" aria-hidden={isOpen}>
        <span>01</span><strong>FILM</strong><small>Short films</small>
      </div>
      <div className="v2-door v2-door--show" aria-hidden={isOpen}>
        <span>02</span><strong>SHOW</strong><small>Live theater</small>
      </div>

      {!isOpen && (
        <button type="button" className="v2-doors__open" onClick={openWithSound}>
          Scroll to open <span><ArrowIcon direction="down" /></span>
        </button>
      )}
      {isOpen && needsPlay && (
        <button type="button" className="v2-video-play" onClick={playTrailer}>Play trailer <span aria-hidden="true">▶</span></button>
      )}
      {isOpen && (
        <button
          type="button"
          className="v2-doors__sound"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
          onClick={() => {
            const video = videoRef.current;
            if (!video) return;
            soundAllowed.current = true;
            video.volume = 1;
            video.muted = !video.muted;
            userMuted.current = video.muted;
            setIsMuted(video.muted);
            playTrailer();
          }}
        >
          {isMuted ? "Unmute" : "Mute"}
        </button>
      )}
      <a className="v2-doors__continue" href="#experience">What is Filmshow? <span><ArrowIcon direction="down" /></span></a>
    </section>
  );
}
