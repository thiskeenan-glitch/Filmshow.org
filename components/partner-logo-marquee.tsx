"use client";

import Image from "next/image";
import { useRef, useState } from "react";
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
  const dragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    startScrollLeft: 0,
  });
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;

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
  };

  const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
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
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    marqueeRef.current?.scrollBy({
      left: event.key === "ArrowRight" ? 180 : -180,
      behavior: "smooth",
    });
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
        {[0, 1].map((groupIndex) => (
          <div
            className="partner-logo-group"
            key={groupIndex}
            aria-hidden={groupIndex === 1 ? "true" : undefined}
          >
            {logos.map((partner) => (
              <a
                className="partner-logo-slot partner-logo-link"
                draggable={false}
                href={partner.url}
                key={`${groupIndex}-${partner.name}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={
                  groupIndex === 0 ? `Visit ${partner.name}` : undefined
                }
                tabIndex={groupIndex === 1 ? -1 : undefined}
              >
                <Image
                  src={partner.image}
                  alt={groupIndex === 0 ? partner.name : ""}
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
