"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

type PosterRevealProps = {
  src: string;
};

export function PosterReveal({ src }: PosterRevealProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const poster = posterRef.current;
    if (!section || !poster) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      section.classList.add("is-poster-revealed");
      poster.style.opacity = "1";
      poster.style.transform = "translate3d(0, 0, 0) rotateX(0deg) scale(1)";
      poster.style.filter = "blur(0px)";
      return;
    }

    let frame = 0;
    let hasFullyRevealed = false;

    const clamp = (value: number) => Math.min(1, Math.max(0, value));
    const mix = (from: number, to: number, progress: number) => from + (to - from) * progress;
    const easeOut = (value: number) => 1 - Math.pow(1 - value, 4);

    const setPosterStyle = (progress: number) => {
      const eased = easeOut(progress);
      const opacity = mix(0, 1, eased);
      const scale = mix(0.82, 1, eased);
      const y = mix(120, 0, eased);
      const rotateX = mix(10, 0, eased);
      const blur = mix(18, 0, eased);
      const shadow = mix(0.14, 0.66, eased);

      poster.style.opacity = opacity.toFixed(3);
      poster.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) rotateX(${rotateX.toFixed(2)}deg) scale(${scale.toFixed(4)})`;
      poster.style.filter = `blur(${blur.toFixed(2)}px)`;
      poster.style.boxShadow = `0 38px 120px rgba(0, 0, 0, ${shadow.toFixed(3)})`;
    };

    const updatePoster = () => {
      frame = 0;

      if (hasFullyRevealed) return;

      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight || 1;
      const start = viewportHeight * 0.85;
      const end = viewportHeight * 0.06;
      const rawProgress = clamp((start - rect.top) / (start - end));

      setPosterStyle(rawProgress);
      section.style.setProperty("--poster-label-opacity", String(mix(0, 1, clamp((rawProgress - 0.18) / 0.45))));
      section.style.setProperty("--poster-label-y", `${mix(14, 0, easeOut(rawProgress)).toFixed(2)}px`);
      section.style.setProperty("--poster-line-scale", String(clamp((rawProgress - 0.22) / 0.48)));

      if (rawProgress >= 0.995) {
        hasFullyRevealed = true;
        section.classList.add("is-poster-revealed");
        setPosterStyle(1);
        section.style.removeProperty("--poster-label-opacity");
        section.style.removeProperty("--poster-label-y");
        section.style.removeProperty("--poster-line-scale");
      }
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updatePoster);
    };

    requestUpdate();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="poster-reveal poster-reveal-scroll"
      aria-label="Featured poster"
    >
      <div className="poster-sticky">
        <div className="poster-stage">
          <div className="poster-label-row">
            <p className="copy-wide small-label text-red-300">VOLUME 1</p>
            <div className="poster-lock-line" />
          </div>
          <div ref={posterRef} className="poster-object-wrap">
            <Image
              src={src}
              alt="Film Show poster"
              width={2160}
              height={2160}
              priority
              unoptimized
              sizes="(max-width: 768px) 92vw, 72vh"
              className="poster-object"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
