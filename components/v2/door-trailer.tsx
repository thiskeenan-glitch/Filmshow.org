"use client";

import { useEffect, useRef, useState } from "react";

export function DoorTrailer() {
  const [isOpen, setIsOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!isOpen) {
      videoRef.current?.pause();
      return;
    }
    videoRef.current?.play().catch(() => undefined);
  }, [isOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <section className={`v2-doors ${isOpen ? "is-open" : ""}`} aria-label="Filmshow trailer">
      <div className="v2-doors__trailer">
        <video
          ref={videoRef}
          controls={isOpen}
          muted
          playsInline
          preload="metadata"
          poster="/images/hero/filmshow-trailer-fallback.jpg"
        >
          <source src="/videos/filmshow-trailer.mp4" type="video/mp4" />
        </video>
        <div className="v2-doors__trailer-label">
          <span>Volume 1 trailer</span>
          <span>Brooklyn · 2026</span>
        </div>
      </div>

      <div className="v2-door v2-door--film" aria-hidden={isOpen}>
        <span>01</span><strong>FILM</strong><small>Short cinema</small>
      </div>
      <div className="v2-door v2-door--show" aria-hidden={isOpen}>
        <span>02</span><strong>SHOW</strong><small>Live performance</small>
      </div>

      {!isOpen ? (
        <button type="button" className="v2-doors__open" onClick={() => setIsOpen(true)}>
          Open the doors <span>↗</span>
        </button>
      ) : (
        <button type="button" className="v2-doors__close" onClick={() => setIsOpen(false)}>
          Close trailer <span>×</span>
        </button>
      )}
      <a className="v2-doors__continue" href="#experience">What is Filmshow? <span>↓</span></a>
    </section>
  );
}
