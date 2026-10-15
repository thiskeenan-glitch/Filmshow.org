"use client";

import { useEffect, useRef, useState } from "react";

export function DoorTrailer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollBlockedUntil = useRef(0);
  const volumeFrame = useRef<number | null>(null);
  const userMuted = useRef(false);

  useEffect(() => {
    try {
      userMuted.current = localStorage.getItem("filmshow-trailer-muted") === "true";
    } catch { /* Keep the in-memory preference if storage is unavailable. */ }
    if (videoRef.current) videoRef.current.muted = userMuted.current;
    setIsMuted(userMuted.current);
  }, []);

  useEffect(() => {
    const openTrailer = () => {
      if (window.location.hash === "#trailer") setIsOpen(true);
    };
    const onHomeClick = (event: MouseEvent) => {
      const link = (event.target as Element)?.closest("a");
      if (!link) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin === window.location.origin && (url.pathname === "/" || url.pathname === "/v2") && url.hash === "#trailer") {
        setIsOpen(true);
        const video = videoRef.current;
        if (video) {
          video.muted = userMuted.current;
          video.play().catch(() => undefined);
        }
      }
    };
    openTrailer();
    window.addEventListener("hashchange", openTrailer);
    document.addEventListener("click", onHomeClick);
    return () => {
      window.removeEventListener("hashchange", openTrailer);
      document.removeEventListener("click", onHomeClick);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || !isOpen) return;
    const observer = new IntersectionObserver(([entry]) => {
      document.documentElement.classList.toggle("v2-recap-visible", entry.isIntersecting);
      const video = videoRef.current;
      if (!video) return;
      if (volumeFrame.current !== null) cancelAnimationFrame(volumeFrame.current);
      const startVolume = video.muted ? 0 : video.volume;
      const targetVolume = entry.isIntersecting && !userMuted.current ? 1 : 0;
      const startTime = performance.now();
      video.volume = startVolume;
      if (entry.isIntersecting) video.muted = userMuted.current;
      const fadeVolume = (now: number) => {
        const progress = Math.min((now - startTime) / 300, 1);
        const eased = progress * progress * (3 - 2 * progress);
        video.volume = startVolume + (targetVolume - startVolume) * eased;
        if (progress < 1) {
          volumeFrame.current = requestAnimationFrame(fadeVolume);
        } else {
          volumeFrame.current = null;
          if (targetVolume === 0) video.muted = true;
        }
      };
      volumeFrame.current = requestAnimationFrame(fadeVolume);
      if (entry.isIntersecting) {
        video.play().catch(() => {
          video.muted = true;
          video.play().catch(() => undefined);
        });
      }
    });
    observer.observe(section);
    return () => {
      if (volumeFrame.current !== null) cancelAnimationFrame(volumeFrame.current);
      volumeFrame.current = null;
      observer.disconnect();
      document.documentElement.classList.remove("v2-recap-visible");
    };
  }, [isOpen]);

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
        setIsOpen(true);
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
  }, [isOpen]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!isOpen) {
      video.pause();
      return;
    }
    let active = true;
    video.muted = userMuted.current;
    video.play().catch((error: DOMException) => {
      if (!active || error.name !== "NotAllowedError") return;
      video.muted = true;
      video.play().catch(() => undefined);
    });
    return () => { active = false; };
  }, [isOpen]);

  const enableSound = () => {
    const video = videoRef.current;
    if (!video || !isOpen || userMuted.current) return;
    if (volumeFrame.current !== null) cancelAnimationFrame(volumeFrame.current);
    volumeFrame.current = null;
    video.volume = 1;
    video.muted = false;
    video.play().catch(() => undefined);
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
          onCanPlay={(event) => {
            if (!isOpen || !event.currentTarget.paused) return;
            const video = event.currentTarget;
            video.play().catch((error: DOMException) => {
              if (error.name !== "NotAllowedError") return;
              video.muted = true;
              video.play().catch(() => undefined);
            });
          }}
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
        <button type="button" className="v2-doors__open" onClick={() => setIsOpen(true)}>
          Scroll to open <span>↓</span>
        </button>
      )}
      {isOpen && (
        <button
          type="button"
          className="v2-doors__sound"
          aria-label={isMuted ? "Unmute video" : "Mute video"}
          onClick={() => {
            const video = videoRef.current;
            if (!video) return;
            if (volumeFrame.current !== null) cancelAnimationFrame(volumeFrame.current);
            volumeFrame.current = null;
            video.volume = 1;
            video.muted = !video.muted;
            userMuted.current = video.muted;
            try {
              localStorage.setItem("filmshow-trailer-muted", String(userMuted.current));
            } catch { /* The preference still persists while this component is mounted. */ }
            setIsMuted(video.muted);
            if (video.paused) video.play().catch(() => undefined);
          }}
        >
          {isMuted ? "Unmute" : "Mute"}
        </button>
      )}
      <a className="v2-doors__continue" href="#experience">What is Filmshow? <span>↓</span></a>
    </section>
  );
}
