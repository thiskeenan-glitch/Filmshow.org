"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { CSSProperties, WheelEvent } from "react";

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
      <Image
        src={currentSrc}
        alt={photo.alt}
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
  const trackRef = useRef<HTMLDivElement>(null);
  const desktopWheelDeltaRef = useRef(0);
  const desktopWheelLockRef = useRef<number | null>(null);
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
        return Math.max(current - 1, 0);
      }

      return Math.min(current + 1, photos.length - 1);
    });
  };

  useEffect(() => {
    return () => {
      if (desktopWheelLockRef.current) {
        window.clearTimeout(desktopWheelLockRef.current);
      }
    };
  }, []);

  const handleDesktopWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (window.matchMedia("(max-width: 767px)").matches) return;

    // Leave ordinary vertical wheel/trackpad movement to the page. The gallery
    // should only respond to a deliberate horizontal gesture.
    if (Math.abs(event.deltaX) <= Math.abs(event.deltaY)) {
      desktopWheelDeltaRef.current = 0;
      return;
    }

    const wheelDelta = event.deltaX;

    if (Math.abs(wheelDelta) < 4) return;

    const direction = wheelDelta > 0 ? "right" : "left";
    const canMove =
      direction === "right"
        ? activeIndex < photos.length - 1
        : activeIndex > 0;

    if (!canMove) {
      desktopWheelDeltaRef.current = 0;
      return;
    }

    event.preventDefault();
    desktopWheelDeltaRef.current += wheelDelta;

    if (desktopWheelLockRef.current || Math.abs(desktopWheelDeltaRef.current) < 42) {
      return;
    }

    const accumulatedDelta = desktopWheelDeltaRef.current;
    desktopWheelDeltaRef.current = 0;
    setActiveIndex((current) => {
      if (accumulatedDelta > 0) {
        return Math.min(current + 1, photos.length - 1);
      }

      return Math.max(current - 1, 0);
    });

    desktopWheelLockRef.current = window.setTimeout(() => {
      desktopWheelLockRef.current = null;
    }, 420);
  };

  return (
    <div className="photo-gallery-shell mt-12" data-reveal="text">
      <div className="photo-gallery-controls" aria-label="Photo gallery controls">
        <button
          type="button"
          className="photo-gallery-arrow"
          onClick={() => scrollGallery("left")}
          disabled={activeIndex === 0}
          aria-label="Previous photo"
        >
          ←
        </button>
        <button
          type="button"
          className="photo-gallery-arrow"
          onClick={() => scrollGallery("right")}
          disabled={activeIndex === photos.length - 1}
          aria-label="Next photo"
        >
          →
        </button>
      </div>

      <div
        ref={galleryRef}
        className="photo-gallery-rail photo-gallery-rail-desktop"
        onWheel={handleDesktopWheel}
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

      <div
        className="photo-gallery-rail photo-gallery-rail-mobile"
        aria-label="Photo gallery"
      >
        <div className="photo-gallery-track">
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
