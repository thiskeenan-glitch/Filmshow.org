"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

export type GalleryPhoto = {
  src: string;
  alt: string;
  position: string;
  caption?: string;
  portrait?: boolean;
  square?: boolean;
  fallbackSrc?: string;
};

type PhotoGalleryProps = {
  photos: GalleryPhoto[];
};

function PhotoGalleryItem({
  photo,
  index,
  total,
  decorative = false,
}: {
  photo: GalleryPhoto;
  index: number;
  total: number;
  decorative?: boolean;
}) {
  const [currentSrc, setCurrentSrc] = useState(photo.src);
  const [isHidden, setIsHidden] = useState(false);
  const attemptedFallbackRef = useRef(false);

  if (isHidden) {
    return null;
  }

  return (
    <figure
      className={`photo-gallery-card ${photo.portrait ? "is-portrait" : ""} ${photo.square ? "is-square" : ""}`}
      style={{ "--reveal-delay": `${index * 70}ms` } as CSSProperties}
      data-reveal="photo"
      data-edge={index === 0 ? "first" : index === total - 1 ? "last" : undefined}
    >
      <Image
        src={currentSrc}
        alt={decorative ? "" : photo.alt}
        fill
        sizes={
          photo.portrait
            ? "(max-width: 767px) 76vw, 32rem"
            : photo.square
              ? "(max-width: 767px) 82vw, 44rem"
              : "(max-width: 767px) 84vw, 54rem"
        }
        className="photo-gallery-image"
        style={{ objectPosition: photo.position }}
        loading="lazy"
        decoding="async"
        onError={() => {
          if (!attemptedFallbackRef.current && photo.fallbackSrc && currentSrc !== photo.fallbackSrc) {
            attemptedFallbackRef.current = true;
            setCurrentSrc(photo.fallbackSrc);
            return;
          }

          setIsHidden(true);
        }}
      />
      {photo.caption ? (
        <figcaption className="photo-gallery-caption">
          {photo.caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef({ active: false, resumeAt: 0 });

  const normalizeScrollPosition = (rail: HTMLDivElement) => {
    const firstGroup = rail.querySelector<HTMLElement>(
      ".photo-gallery-group",
    );
    const cycleWidth = firstGroup?.offsetWidth ?? 0;
    if (!cycleWidth) return;

    if (rail.scrollLeft >= cycleWidth * 2) {
      rail.scrollLeft -= cycleWidth;
    } else if (rail.scrollLeft < cycleWidth * 0.5) {
      rail.scrollLeft += cycleWidth;
    }
  };

  const scrollGallery = (direction: "left" | "right") => {
    const rail = galleryRef.current;
    if (!rail) return;

    const card = rail.querySelector<HTMLElement>(".photo-gallery-card");
    const distance = card ? card.offsetWidth + 28 : rail.clientWidth * 0.72;
    interactionRef.current.resumeAt = performance.now() + 900;
    rail.scrollBy({
      left: direction === "right" ? distance : -distance,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const rail = galleryRef.current;
    if (!rail) return;

    const firstGroup = rail.querySelector<HTMLElement>(
      ".photo-gallery-group",
    );
    if (firstGroup) {
      rail.scrollLeft = firstGroup.offsetWidth;
    }

    let previousTime = performance.now();
    let animationFrame = 0;
    let pendingPixels = 0;
    const pixelsPerSecond = 26;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const animate = (currentTime: number) => {
      const elapsed = Math.min(currentTime - previousTime, 64);
      previousTime = currentTime;

      if (
        !reducedMotion.matches &&
        !interactionRef.current.active &&
        currentTime >= interactionRef.current.resumeAt
      ) {
        pendingPixels += (pixelsPerSecond * elapsed) / 1000;
        const wholePixels = Math.floor(pendingPixels);
        if (wholePixels > 0) {
          rail.scrollLeft += wholePixels;
          pendingPixels -= wholePixels;
        }
      } else {
        pendingPixels = 0;
      }

      normalizeScrollPosition(rail);
      animationFrame = requestAnimationFrame(animate);
    };

    const handleWheel = (event: globalThis.WheelEvent) => {
      const horizontalIntent =
        event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY);
      if (!horizontalIntent) return;

      const rawDelta = event.deltaX || event.deltaY;
      const deltaScale =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? rail.clientWidth
            : 1;
      const wheelDelta = rawDelta * deltaScale;
      if (Math.abs(wheelDelta) < 0.5) return;

      event.preventDefault();
      rail.scrollLeft += wheelDelta;
      normalizeScrollPosition(rail);
      interactionRef.current.resumeAt = performance.now() + 700;
    };

    const resizeObserver = new ResizeObserver(() => {
      normalizeScrollPosition(rail);
    });

    rail.addEventListener("wheel", handleWheel, { passive: false });
    resizeObserver.observe(rail);
    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      rail.removeEventListener("wheel", handleWheel);
    };
  }, []);

  const pauseForPointer = () => {
    interactionRef.current.active = true;
  };

  const resumeAfterPointer = () => {
    interactionRef.current.active = false;
    interactionRef.current.resumeAt = performance.now() + 700;
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
        aria-label="Photo gallery"
        onPointerCancel={resumeAfterPointer}
        onPointerDown={pauseForPointer}
        onPointerUp={resumeAfterPointer}
      >
        <div className="photo-gallery-track">
          {[0, 1, 2].map((groupIndex) => (
            <div
              className="photo-gallery-group"
              key={groupIndex}
              aria-hidden={groupIndex === 1 ? undefined : "true"}
            >
              {photos.map((photo, index) => (
                <PhotoGalleryItem
                  key={`${groupIndex}-${photo.src}`}
                  photo={photo}
                  index={index}
                  total={photos.length}
                  decorative={groupIndex !== 1}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
