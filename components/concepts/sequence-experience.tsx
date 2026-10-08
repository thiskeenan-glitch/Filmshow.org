"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const beats = [
  {
    kind: "FILM",
    count: "01",
    line: "The room goes dark.",
    detail: "A short film begins. No feed, no second screen — just an audience paying attention together.",
    image: "/images/the-crowd.jpg",
  },
  {
    kind: "SHOW",
    count: "02",
    line: "Someone enters the frame.",
    detail: "The screen gives way to a body, a voice, a ladder, a joke, or a thing nobody rehearsed.",
    image: "/images/optimized/gallery-ladder.jpg",
  },
  {
    kind: "FILM",
    count: "03",
    line: "Another world opens.",
    detail: "Fiction, documentary, animation, experiment — each film earns its place in the room.",
    image: "/images/lineup/violet-and-marlowe.jpg",
  },
  {
    kind: "SHOW",
    count: "04",
    line: "The room answers back.",
    detail: "Clowning, circus, theater, and comedy rupture the expected shape of a screening.",
    image: "/images/optimized/gallery-3-people.jpg",
  },
  {
    kind: "FILM",
    count: "05",
    line: "Light returns to the screen.",
    detail: "A new filmmaker. A new language. Fifteen minutes or less to change the temperature.",
    image: "/images/lineup/intimite.jpg",
  },
  {
    kind: "SHOW",
    count: "06",
    line: "No two nights repeat.",
    detail: "The final interruption is live, unstable, and shared only by the people who were there.",
    image: "/images/optimized/gallery-high-five.jpg",
  },
] as const;

export function SequenceExperience() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-sequence-beat]"));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(Number((visible.target as HTMLElement).dataset.sequenceBeat));
      },
      { threshold: [0.35, 0.6, 0.8] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="sequence">
      <section className="sequence-hero">
        <p className="concept-kicker">A night in six movements</p>
        <h1><span>FILM</span><i>/</i><span>SHOW</span></h1>
        <p className="sequence-hero__dek">Cinema keeps getting interrupted.<br />That is the point.</p>
        <a href="#movement-1" className="sequence-hero__scroll">Follow the sequence <span>↓</span></a>
      </section>

      <div className="sequence-progress" aria-hidden="true">
        <span>{String(active + 1).padStart(2, "0")}</span>
        <div>{beats.map((_, index) => <i key={index} className={index === active ? "is-active" : ""} />)}</div>
        <span>06</span>
      </div>

      <div className="sequence-beats">
        {beats.map((beat, index) => (
          <section
            key={beat.count}
            id={`movement-${index + 1}`}
            data-sequence-beat={index}
            className={`sequence-beat sequence-beat--${beat.kind.toLowerCase()}`}
          >
            <div className="sequence-beat__image-wrap">
              <div className="sequence-beat__image" style={{ backgroundImage: `url(${beat.image})` }} />
              <span className="sequence-beat__stamp">Brooklyn / V{index + 1}</span>
            </div>
            <div className="sequence-beat__copy">
              <span className="sequence-beat__count">Movement {beat.count}</span>
              <h2>{beat.kind}</h2>
              <h3>{beat.line}</h3>
              <p>{beat.detail}</p>
            </div>
          </section>
        ))}
      </div>

      <section className="sequence-end">
        <p className="concept-kicker">The next room is waiting</p>
        <h2>This is not<br />a festival.</h2>
        <div className="sequence-end__actions">
          <Link href="/tickets">Get tickets <span>↗</span></Link>
          <a href="https://filmfreeway.com/TheFilmShow" target="_blank" rel="noreferrer">Submit a film <span>↗</span></a>
          <Link href="/">Enter Filmshow <span>→</span></Link>
        </div>
      </section>
    </main>
  );
}
