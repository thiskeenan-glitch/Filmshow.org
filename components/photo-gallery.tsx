"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

export type GalleryPhoto = {
  src: string;
  alt: string;
  position: string;
  portrait?: boolean;
  square?: boolean;
  fallbackSrc?: string;
};

type PhotoGalleryProps = {
  photos: GalleryPhoto[];
};

function PhotoGalleryItem({ photo, index, total }: { photo: GalleryPhoto; index: number; total: number }) {
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
      <img
        src={currentSrc}
        alt={photo.alt}
        className="photo-gallery-image"
        style={{ objectPosition: photo.position }}
        loading={index < 2 ? "eager" : "lazy"}
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
    </figure>
  );
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const galleryRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [trackOffset, setTrackOffset] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const rail = galleryRef.current;
      const track = trackRef.current;
      if (!rail || !track) return;

      const cards = track.querySelectorAll<HTMLElement>(".photo-gallery-card");
      const activeCard = cards[activeIndex];
      if (!activeCard) {
        setTrackOffset(0);
        return;
      }

      const maxOffset = Math.max(0, track.scrollWidth - rail.clientWidth);
      setTrackOffset(Math.min(activeCard.offsetLeft, maxOffset));
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [activeIndex]);

  const scrollGallery = (direction: "left" | "right") => {
    setActiveIndex((current) => {
      if (direction === "left") {
        return current === 0 ? photos.length - 1 : current - 1;
      }

      return current === photos.length - 1 ? 0 : current + 1;
    });
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
      >
        <div
          ref={trackRef}
          className="photo-gallery-track"
          style={{ transform: `translate3d(${-trackOffset}px, 0, 0)` }}
        >
          {photos.map((photo, index) => (
            <PhotoGalleryItem
              key={photo.src}
              photo={photo}
              index={index}
              total={photos.length}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
