"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type {
  KeyboardEvent,
  MouseEvent,
  PointerEvent,
  WheelEvent,
} from "react";

type PartnerLogo = {
  name: string;
  image: string;
  width: number;
  height: number;
  className: string;
  url: string;
};

type PartnerLogoMarqueeProps = {
  logos: readonly PartnerLogo[];
};

export function PartnerLogoMarquee({ logos }: PartnerLogoMarqueeProps) {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef({ active: false, resumeAt: 0 });
  const dragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    startScrollLeft: 0,
  });
  const [isDragging, setIsDragging] = useState(false);

  const normalizeScrollPosition = (marquee: HTMLDivElement) => {
    const firstGroup = marquee.querySelector<HTMLElement>(
      ".partner-logo-group",
    );
    const cycleWidth = firstGroup?.offsetWidth ?? 0;
    if (!cycleWidth) return;

    if (marquee.scrollLeft >= cycleWidth * 2) {
      marquee.scrollLeft -= cycleWidth;
    } else if (marquee.scrollLeft < cycleWidth * 0.5) {
      marquee.scrollLeft += cycleWidth;
    }
  };

  useEffect(() => {
    const marquee = marqueeRef.current;
    if (!marquee) return;

    const positionAtMiddleCopy = () => {
      const firstGroup = marquee.querySelector<HTMLElement>(
        ".partner-logo-group",
      );
      if (firstGroup && marquee.scrollLeft === 0) {
        marquee.scrollLeft = firstGroup.offsetWidth;
      }
    };

    positionAtMiddleCopy();

    let previousTime = performance.now();
    let animationFrame = 0;
    const pixelsPerSecond = 34;

    const animate = (currentTime: number) => {
      const elapsed = Math.min(currentTime - previousTime, 64);
      previousTime = currentTime;

      if (
        !interactionRef.current.active &&
        currentTime >= interactionRef.current.resumeAt
      ) {
        marquee.scrollLeft += (pixelsPerSecond * elapsed) / 1000;
      }

      normalizeScrollPosition(marquee);
      animationFrame = requestAnimationFrame(animate);
    };

    const resizeObserver = new ResizeObserver(() => {
      normalizeScrollPosition(marquee);
    });
    resizeObserver.observe(marquee);
    animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, []);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    interactionRef.current.active = true;
    interactionRef.current.resumeAt = Number.POSITIVE_INFINITY;

    if (event.pointerType !== "mouse") {
      dragRef.current.moved = false;
      return;
    }

    dragRef.current = {
      active: true,
      moved: false,
      startX: event.clientX,
      startScrollLeft: event.currentTarget.scrollLeft,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;

    const distance = event.clientX - dragRef.current.startX;
    if (Math.abs(distance) > 4) dragRef.current.moved = true;
    event.currentTarget.scrollLeft =
      dragRef.current.startScrollLeft - distance;
    normalizeScrollPosition(event.currentTarget);
    dragRef.current.startScrollLeft =
      event.currentTarget.scrollLeft + distance;
  };

  const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
    interactionRef.current.active = false;
    interactionRef.current.resumeAt = performance.now() + 450;

    if (!dragRef.current.active) return;

    dragRef.current.active = false;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDragging(false);
  };

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!dragRef.current.moved) return;

    event.preventDefault();
    event.stopPropagation();
    dragRef.current.moved = false;
  };

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    const horizontalIntent =
      event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY);
    if (!horizontalIntent) return;

    event.preventDefault();
    event.currentTarget.scrollLeft += event.deltaX || event.deltaY;
    normalizeScrollPosition(event.currentTarget);
    interactionRef.current.resumeAt = performance.now() + 220;
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    if (!marqueeRef.current) return;

    marqueeRef.current.scrollLeft +=
      event.key === "ArrowRight" ? 180 : -180;
    normalizeScrollPosition(marqueeRef.current);
    interactionRef.current.resumeAt = performance.now() + 220;
  };

  return (
    <div
      ref={marqueeRef}
      className={`partner-marquee ${isDragging ? "is-dragging" : ""}`}
      role="region"
      aria-label="Filmshow partners — horizontally scrollable"
      tabIndex={0}
      onClickCapture={handleClickCapture}
      onKeyDown={handleKeyDown}
      onPointerCancel={finishDrag}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onWheel={handleWheel}
    >
      <div className="partner-marquee-track">
        {[0, 1, 2].map((groupIndex) => (
          <div
            className="partner-logo-group"
            key={groupIndex}
            aria-hidden={groupIndex === 1 ? undefined : "true"}
          >
            {logos.map((partner) => (
              <a
                className="partner-logo-slot partner-logo-link"
                draggable={false}
                href={partner.url}
                key={`${groupIndex}-${partner.name}`}
                target="_blank"
                rel="noopener noreferrer"
                title={`Visit ${partner.name}`}
                aria-label={
                  groupIndex === 1 ? `Visit ${partner.name}` : undefined
                }
                tabIndex={groupIndex === 1 ? undefined : -1}
              >
                <Image
                  src={partner.image}
                  alt={groupIndex === 1 ? partner.name : ""}
                  draggable={false}
                  width={partner.width}
                  height={partner.height}
                  sizes="(min-width: 1024px) 18rem, 11rem"
                  className={`partner-logo-image ${partner.className}`}
                />
              </a>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
