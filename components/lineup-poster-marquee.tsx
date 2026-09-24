"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, PointerEvent, WheelEvent } from "react";

type LineupFilm = {
  title: string;
  poster: string;
  width: number;
  height: number;
};

type LineupPosterMarqueeProps = {
  films: readonly LineupFilm[];
};

export function LineupPosterMarquee({ films }: LineupPosterMarqueeProps) {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const pauseUntilRef = useRef(0);
  const dragRef = useRef({
    active: false,
    startX: 0,
    startScrollLeft: 0,
  });
  const [isDragging, setIsDragging] = useState(false);

  const normalizeScrollPosition = (marquee: HTMLDivElement) => {
    const firstGroup = marquee.querySelector<HTMLElement>(
      ".lineup-poster-group",
    );
    const cycleWidth = firstGroup?.offsetWidth ?? 0;
    if (!cycleWidth) return;

    if (marquee.scrollLeft >= cycleWidth * 2) {
      marquee.scrollLeft -= cycleWidth;
    } else if (marquee.scrollLeft < cycleWidth * 0.5) {
      marquee.scrollLeft += cycleWidth;
    }
  };

  const pauseAutoScroll = (milliseconds = 700) => {
    pauseUntilRef.current = performance.now() + milliseconds;
  };

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    const positionAtMiddleCopy = () => {
      const firstGroup = marquee.querySelector<HTMLElement>(
        ".lineup-poster-group",
      );
      if (firstGroup && marquee.scrollLeft === 0) {
        marquee.scrollLeft = firstGroup.offsetWidth;
      }
    };

    positionAtMiddleCopy();

    let previousTime = performance.now();
    let animationFrame = 0;
    let pendingPixels = 0;
    const pixelsPerSecond = 32;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const animate = (currentTime: number) => {
      const elapsed = Math.min(currentTime - previousTime, 64);
      previousTime = currentTime;

      if (
        !reducedMotion.matches &&
        !dragRef.current.active &&
        currentTime >= pauseUntilRef.current
      ) {
        pendingPixels += (pixelsPerSecond * elapsed) / 1000;
        const wholePixels = Math.floor(pendingPixels);
        if (wholePixels > 0) {
          marquee.scrollLeft += wholePixels;
          pendingPixels -= wholePixels;
        }
      } else {
        pendingPixels = 0;
      }

      normalizeScrollPosition(marquee);
      animationFrame = requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(positionAtMiddleCopy);
    resizeObserver.observe(marquee);
    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, []);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    pauseUntilRef.current = Number.POSITIVE_INFINITY;

    if (event.pointerType !== "mouse" || event.button !== 0) return;

    dragRef.current = {
      active: true,
      startX: event.clientX,
      startScrollLeft: event.currentTarget.scrollLeft,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;

    const distance = event.clientX - dragRef.current.startX;
    event.currentTarget.scrollLeft =
      dragRef.current.startScrollLeft - distance;
    normalizeScrollPosition(event.currentTarget);
    dragRef.current.startScrollLeft =
      event.currentTarget.scrollLeft + distance;
  };

  const finishInteraction = (event: PointerEvent<HTMLDivElement>) => {
    if (dragRef.current.active) {
      dragRef.current.active = false;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
      setIsDragging(false);
    }

    pauseAutoScroll();
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    const horizontalIntent =
      event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY);
    if (!horizontalIntent) return;

    event.preventDefault();
    event.currentTarget.scrollLeft += event.deltaX || event.deltaY;
    normalizeScrollPosition(event.currentTarget);
    pauseAutoScroll(350);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    const marquee = marqueeRef.current;
    if (!marquee) return;

    marquee.scrollLeft += event.key === "ArrowRight" ? 260 : -260;
    normalizeScrollPosition(marquee);
    pauseAutoScroll();
  };

  return (
    <div
      ref={marqueeRef}
      className={`lineup-poster-marquee ${isDragging ? "is-dragging" : ""}`}
      role="region"
      aria-label="Filmshow Vol. 1 film posters — horizontally scrollable"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onPointerCancel={finishInteraction}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishInteraction}
      onWheel={handleWheel}
    >
      <div className="lineup-poster-track">
        {[0, 1, 2].map((groupIndex) => (
          <div
            className="lineup-poster-group"
            key={groupIndex}
            aria-hidden={groupIndex === 1 ? undefined : "true"}
          >
            {films.map((film, index) => (
              <figure
                className="lineup-poster-card"
                key={`${groupIndex}-${film.title}`}
              >
                <div className="lineup-poster-image-wrap">
                  <Image
                    src={film.poster}
                    alt={
                      groupIndex === 1
                        ? `${film.title} official poster`
                        : ""
                    }
                    draggable={false}
                    width={film.width}
                    height={film.height}
                    sizes="(min-width: 1024px) 31rem, 78vw"
                    className="lineup-poster-image"
                    priority={groupIndex === 1 && index === 0}
                  />
                </div>
                <figcaption>
                  <span>0{index + 1}</span>
                  {film.title}
                </figcaption>
              </figure>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
