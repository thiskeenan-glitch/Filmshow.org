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
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollGallery = (direction: "left" | "right") => {
    const rail = galleryRef.current;
    const track = trackRef.current;
    if (!rail || !track) return;

    const nextIndex =
      direction === "left"
        ? Math.max(activeIndex - 1, 0)
        : Math.min(activeIndex + 1, photos.length - 1);
    const cards = track.querySelectorAll<HTMLElement>(".photo-gallery-card");
    const nextCard = cards[nextIndex];
    if (!nextCard) return;

    const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
    rail.scrollTo({
      left: Math.min(nextCard.offsetLeft, maxScroll),
      behavior: "smooth",
    });
    setActiveIndex(nextIndex);
  };

  const updateDesktopActiveIndex = () => {
    if (window.matchMedia("(max-width: 767px)").matches) return;

    const rail = galleryRef.current;
    const track = trackRef.current;
    if (!rail || !track) return;

    const cards = Array.from(
      track.querySelectorAll<HTMLElement>(".photo-gallery-card"),
    );
    if (!cards.length) return;

    const viewportCenter = rail.scrollLeft + rail.clientWidth / 2;
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(cardCenter - viewportCenter);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    setActiveIndex(nearestIndex);
  };

  useEffect(() => {
    const rail = galleryRef.current;
    if (!rail) return;

    const handleWheel = (event: globalThis.WheelEvent) => {
      if (window.matchMedia("(max-width: 767px)").matches) return;

      const rawDelta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
          ? event.deltaX
          : event.deltaY;
      const deltaScale =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? rail.clientWidth
            : 1;
      const wheelDelta = rawDelta * deltaScale;
      if (Math.abs(wheelDelta) < 0.5) return;

      const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
      const atStart = rail.scrollLeft <= 1;
      const atEnd = rail.scrollLeft >= maxScroll - 1;

      if ((wheelDelta < 0 && atStart) || (wheelDelta > 0 && atEnd)) {
        return;
      }

      event.preventDefault();
      rail.scrollLeft = Math.max(
        0,
        Math.min(maxScroll, rail.scrollLeft + wheelDelta),
      );
    };

    rail.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      rail.removeEventListener("wheel", handleWheel);
    };
  }, []);

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
        onScroll={updateDesktopActiveIndex}
      >
        <div
          ref={trackRef}
          className="photo-gallery-track"
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
