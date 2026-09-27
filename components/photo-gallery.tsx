"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type GalleryPhoto = {
  src: string;
  alt: string;
  position: string;
  width: number;
  height: number;
  caption?: string;
  portrait?: boolean;
  square?: boolean;
  fallbackSrc?: string;
};

type PhotoGalleryProps = {
  photos: GalleryPhoto[];
};

function GalleryImage({
  photo,
  sizes,
  className,
}: {
  photo: GalleryPhoto;
  sizes: string;
  className: string;
}) {
  const [currentSrc, setCurrentSrc] = useState(photo.src);
  const attemptedFallbackRef = useRef(false);

  useEffect(() => {
    attemptedFallbackRef.current = false;
    setCurrentSrc(photo.src);
  }, [photo.src]);

  return (
    <Image
      src={currentSrc}
      alt={photo.alt}
      fill
      sizes={sizes}
      className={className}
      style={{ objectPosition: photo.position }}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (
          !attemptedFallbackRef.current &&
          photo.fallbackSrc &&
          currentSrc !== photo.fallbackSrc
        ) {
          attemptedFallbackRef.current = true;
          setCurrentSrc(photo.fallbackSrc);
        }
      }}
    />
  );
}

function GalleryThumbnail({ photo }: { photo: GalleryPhoto }) {
  const [currentSrc, setCurrentSrc] = useState(photo.src);
  const attemptedFallbackRef = useRef(false);

  return (
    <Image
      src={currentSrc}
      alt={photo.alt}
      width={photo.width}
      height={photo.height}
      sizes="(max-width: 767px) 33vw, 25vw"
      className="photo-collage-image"
      loading="lazy"
      decoding="async"
      onError={() => {
        if (
          !attemptedFallbackRef.current &&
          photo.fallbackSrc &&
          currentSrc !== photo.fallbackSrc
        ) {
          attemptedFallbackRef.current = true;
          setCurrentSrc(photo.fallbackSrc);
        }
      }}
    />
  );
}

export function PhotoGallery({ photos }: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);

  const showPreviousPhoto = () => {
    setSelectedIndex((currentIndex) =>
      currentIndex === null
        ? null
        : (currentIndex - 1 + photos.length) % photos.length,
    );
  };

  const showNextPhoto = () => {
    setSelectedIndex((currentIndex) =>
      currentIndex === null ? null : (currentIndex + 1) % photos.length,
    );
  };

  useEffect(() => {
    if (selectedIndex === null) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedIndex(null);
      if (event.key === "ArrowLeft") {
        setSelectedIndex((currentIndex) =>
          currentIndex === null
            ? null
            : (currentIndex - 1 + photos.length) % photos.length,
        );
      }
      if (event.key === "ArrowRight") {
        setSelectedIndex((currentIndex) =>
          currentIndex === null ? null : (currentIndex + 1) % photos.length,
        );
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [selectedIndex, photos.length]);

  const selectedPhoto =
    selectedIndex === null ? null : photos[selectedIndex] ?? null;

  const lightbox =
    selectedPhoto && typeof document !== "undefined"
      ? createPortal(
          <div
            className="photo-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="Enlarged Filmshow photo"
            onMouseDown={(event) => {
              if (event.currentTarget === event.target) setSelectedIndex(null);
            }}
          >
            <button
              type="button"
              className="photo-lightbox-close"
              onClick={() => setSelectedIndex(null)}
              aria-label="Close enlarged photo"
              autoFocus
            >
              ×
            </button>
            <button
              type="button"
              className="photo-lightbox-arrow photo-lightbox-arrow-previous"
              onClick={showPreviousPhoto}
              aria-label="Show previous photo"
            >
              ←
            </button>
            <div
              className="photo-lightbox-image-wrap"
              onTouchStart={(event) => {
                const touch = event.touches[0];
                touchStartXRef.current = touch?.clientX ?? null;
                touchStartYRef.current = touch?.clientY ?? null;
              }}
              onTouchEnd={(event) => {
                const startX = touchStartXRef.current;
                const startY = touchStartYRef.current;
                const touch = event.changedTouches[0];

                touchStartXRef.current = null;
                touchStartYRef.current = null;

                if (startX === null || startY === null || !touch) return;

                const distanceX = touch.clientX - startX;
                const distanceY = touch.clientY - startY;

                if (
                  Math.abs(distanceX) < 42 ||
                  Math.abs(distanceX) <= Math.abs(distanceY)
                ) {
                  return;
                }

                if (distanceX > 0) showPreviousPhoto();
                else showNextPhoto();
              }}
            >
              <GalleryImage
                photo={selectedPhoto}
                sizes="90vw"
                className="photo-lightbox-image"
              />
            </div>
            <button
              type="button"
              className="photo-lightbox-arrow photo-lightbox-arrow-next"
              onClick={showNextPhoto}
              aria-label="Show next photo"
            >
              →
            </button>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="photo-gallery-shell mt-12" data-reveal="text">
      <div className="photo-collage" aria-label="Filmshow photo collage">
        {photos.map((photo, index) => (
          <button
            type="button"
            className="photo-collage-card"
            key={photo.src}
            onClick={() => setSelectedIndex(index)}
            aria-label={`Enlarge photo: ${photo.alt}`}
          >
            <GalleryThumbnail photo={photo} />
          </button>
        ))}
      </div>

      {lightbox}
    </div>
  );
}
