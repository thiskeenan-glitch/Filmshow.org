"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Door = "film" | "show";

const doorContent = {
  film: {
    eyebrow: "Short cinema / selected without borders",
    title: "FILM",
    body: "Extraordinary short films projected in a room built for attention — not algorithms. Every work is selected for what it does to a live audience.",
    image: "/images/lineup/vultures.jpg",
    index: "A",
  },
  show: {
    eyebrow: "Theater / clown / circus / interruption",
    title: "SHOW",
    body: "Between screenings, the room changes shape. Performers, comedians, actors, and beautiful accidents turn a program into an unrepeatable night.",
    image: "/images/optimized/gallery-ladder.jpg",
    index: "B",
  },
} as const;

export function DoorsExperience() {
  const [openDoor, setOpenDoor] = useState<Door | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!openDoor) return;
    closeButtonRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenDoor(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [openDoor]);

  return (
    <main className={`doors ${openDoor ? `doors--open-${openDoor}` : ""}`}>
      <div className="doors__backdrop" aria-hidden="true">
        <div className="doors__backdrop-film" />
        <div className="doors__backdrop-show" />
      </div>

      <div className="doors__intro">
        <span>Brooklyn / Twice yearly</span>
        <span>This is not a festival.</span>
      </div>

      <div className="doors__panels" aria-label="Choose an entrance">
        {(["film", "show"] as Door[]).map((door) => {
          const content = doorContent[door];
          return (
            <button
              key={door}
              type="button"
              className={`door door--${door}`}
              onClick={() => setOpenDoor(door)}
              aria-expanded={openDoor === door}
              aria-label={`Open ${door} introduction`}
            >
              <span className="door__index">{content.index}</span>
              <span className="door__title">{content.title}</span>
              <span className="door__hint">Enter <span aria-hidden="true">↗</span></span>
            </button>
          );
        })}
      </div>

      <section className="door-reveal" aria-live="polite" aria-hidden={!openDoor}>
        {openDoor ? (
          <>
            <div
              className="door-reveal__image"
              style={{ backgroundImage: `url(${doorContent[openDoor].image})` }}
            />
            <button
              ref={closeButtonRef}
              className="door-reveal__close"
              type="button"
              onClick={() => setOpenDoor(null)}
            >
              Close <span aria-hidden="true">×</span>
            </button>
            <div className="door-reveal__copy">
              <p>{doorContent[openDoor].eyebrow}</p>
              <h1>{doorContent[openDoor].title}</h1>
              <div>
                <p>{doorContent[openDoor].body}</p>
                <button
                  type="button"
                  onClick={() => setOpenDoor(openDoor === "film" ? "show" : "film")}
                >
                  Explore {openDoor === "film" ? "show" : "film"} <span aria-hidden="true">→</span>
                </button>
              </div>
            </div>
          </>
        ) : null}
      </section>

      <Link href="/" className="doors__skip">
        Enter Filmshow <span aria-hidden="true">→</span>
      </Link>
    </main>
  );
}
