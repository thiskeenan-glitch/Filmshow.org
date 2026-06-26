"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef } from "react";
import type { CSSProperties, WheelEvent } from "react";

export type GalleryPhoto = {
  src: string;
  alt: string;
  position: string;
  portrait?: boolean;
  square?: boolean;
};

type PhotoGalleryProps = {
  photos: GalleryPhoto[];
};

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const clampTimeoutRef = useRef<number | null>(null);

  const getMaxScrollLeft = (el: HTMLDivElement) => Math.max(0, el.scrollWidth - el.clientWidth);

  const clampScrollPosition = useCallback((behavior: ScrollBehavior = "smooth") => {
    const el = galleryRef.current;
    if (!el) return;

    const maxScrollLeft = getMaxScrollLeft(el);
    if (el.scrollLeft < 0) {
      el.scrollTo({ left: 0, behavior });
    } else if (el.scrollLeft > maxScrollLeft) {
      el.scrollTo({ left: maxScrollLeft, behavior });
    }
  }, []);

  useEffect(() => {
    const el = galleryRef.current;
    if (!el) return;

    const handleScroll = () => {
      if (clampTimeoutRef.current) {
        window.clearTimeout(clampTimeoutRef.current);
      }
      clampTimeoutRef.current = window.setTimeout(() => clampScrollPosition(), 90);
    };

    const handleResize = () => {
      clampScrollPosition("auto");
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      if (clampTimeoutRef.current) {
        window.clearTimeout(clampTimeoutRef.current);
      }
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [clampScrollPosition]);

  const reboundAtEdge = (direction: "left" | "right") => {
    const el = galleryRef.current;
    if (!el) return;

    el.dataset.rebound = direction;
    window.setTimeout(() => {
      if (galleryRef.current) {
        delete galleryRef.current.dataset.rebound;
      }
    }, 220);
  };

  const scrollGallery = (direction: "left" | "right") => {
    const el = galleryRef.current;
    if (!el) return;

    const maxScrollLeft = getMaxScrollLeft(el);

    if (direction === "left" && el.scrollLeft <= 8) {
      el.scrollTo({ left: maxScrollLeft, behavior: "smooth" });
      return;
    }

    if (direction === "right" && el.scrollLeft >= maxScrollLeft - 8) {
      el.scrollTo({ left: 0, behavior: "smooth" });
      return;
    }

    const card = el.querySelector<HTMLElement>(".photo-gallery-card");
    const track = el.querySelector<HTMLElement>(".photo-gallery-track");
    const gap = track ? Number.parseFloat(window.getComputedStyle(track).columnGap) || 0 : 0;
    const amount = card ? card.offsetWidth + gap : el.clientWidth * 0.82;
    const target = Math.min(
      maxScrollLeft,
      Math.max(0, el.scrollLeft + (direction === "right" ? amount : -amount)),
    );

    el.scrollTo({
      left: target,
      behavior: "smooth",
    });
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    const el = galleryRef.current;
    if (!el) return;

    const maxScrollLeft = getMaxScrollLeft(el);
    const horizontalIntent = Math.abs(event.deltaX) >= Math.abs(event.deltaY);
    const atStart = el.scrollLeft <= 8;
    const atEnd = el.scrollLeft >= maxScrollLeft - 8;

    if (!horizontalIntent) return;

    if (atStart && event.deltaX < 0) {
      event.preventDefault();
      reboundAtEdge("left");
      el.scrollTo({ left: 0, behavior: "smooth" });
    }

    if (atEnd && event.deltaX > 0) {
      event.preventDefault();
      reboundAtEdge("right");
      el.scrollTo({ left: maxScrollLeft, behavior: "smooth" });
    }
  };

  return (
    <div className="photo-gallery-shell mt-12" data-reveal="text">
      <div className="photo-gallery-controls" aria-label="Photo gallery controls">
        <button
          type="button"
          className="photo-gallery-arrow"
          onClick={() => scrollGallery("left")}
          aria-label="Previous photo"
        >
          ←
        </button>
        <button
          type="button"
          className="photo-gallery-arrow"
          onClick={() => scrollGallery("right")}
          aria-label="Next photo"
        >
          →
        </button>
      </div>

      <div
        ref={galleryRef}
        className="photo-gallery-rail"
        onWheel={handleWheel}
        onTouchEnd={() => clampScrollPosition()}
        onPointerUp={() => clampScrollPosition()}
      >
        <div className="photo-gallery-track">
          {photos.map((photo, index) => (
            <figure
              key={photo.src}
              className={`photo-gallery-card ${photo.portrait ? "is-portrait" : ""} ${photo.square ? "is-square" : ""}`}
              style={{ "--reveal-delay": `${index * 70}ms` } as CSSProperties}
              data-reveal="photo"
              data-edge={index === 0 ? "first" : index === photos.length - 1 ? "last" : undefined}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.portrait ? 1400 : 1800}
                height={photo.portrait ? 1800 : 1050}
                unoptimized
                sizes="(max-width: 768px) 84vw, 58vw"
                className="photo-gallery-image"
                style={{ objectPosition: photo.position }}
              />
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
}
