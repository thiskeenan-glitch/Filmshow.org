"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

const beats = [
  { kind: "SHOW", label: "Live performance", detail: "Theater · Clown · Circus · Comedy", image: "/images/optimized/gallery-ladder.jpg" },
  { kind: "FILM", label: "Short cinema", detail: "15 minutes or less", image: "/images/the-crowd.jpg" },
  { kind: "SHOW", label: "Live performance", detail: "Between every film", image: "/images/optimized/gallery-3-people.jpg" },
  { kind: "FILM", label: "Short cinema", detail: "Projected for a live audience", image: "/images/lineup/violet-and-marlowe.jpg" },
  { kind: "SHOW", label: "Live performance", detail: "Made for the room", image: "/images/optimized/gallery-high-five.jpg" },
  { kind: "FILM", label: "Short cinema", detail: "Selected from around the world", image: "/images/lineup/intimite.jpg" },
] as const;

export function SequenceExperience() {
  const stageRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    let frame = 0;
    const update = () => {
      const rect = stage.getBoundingClientRect();
      const scrollable = Math.max(stage.offsetHeight - window.innerHeight, 1);
      const progress = Math.min(1, Math.max(0, -rect.top / scrollable));
      const separation = Math.sin(progress * Math.PI);
      const reveal = Math.min(1, Math.max(0, (separation - 0.18) / 0.55));
      const resolve = Math.min(1, Math.max(0, (progress - 0.9) / 0.08));

      stage.style.setProperty("--glass-progress", progress.toFixed(4));
      stage.style.setProperty("--glass-separation", separation.toFixed(4));
      stage.style.setProperty("--glass-reveal", reveal.toFixed(4));
      stage.style.setProperty("--glass-resolve", resolve.toFixed(4));
      stage.style.setProperty("--glass-film-x", `${(-19 * separation).toFixed(2)}vw`);
      stage.style.setProperty("--glass-show-x", `${(19 * separation).toFixed(2)}vw`);
      stage.style.setProperty("--glass-film-y", `${(-23 * separation).toFixed(2)}vh`);
      stage.style.setProperty("--glass-show-y", `${(23 * separation).toFixed(2)}vh`);
      stage.style.setProperty("--glass-lift", `${(2 * (1 - reveal)).toFixed(2)}rem`);
      stage.style.setProperty("--glass-resolve-lift", `${(2 * (1 - resolve)).toFixed(2)}rem`);
      frame = 0;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <main className="sequence sequence--combined">
      <header className="combined-nav">
        <Link href="/" className="combined-nav__brand"><i />FILMSHOW</Link>
        <p>Brooklyn · Twice yearly</p>
        <div>
          <Link href="/tickets">Tickets</Link>
          <a href="https://filmfreeway.com/TheFilmShow" target="_blank" rel="noreferrer">Submit</a>
        </div>
      </header>

      <section ref={stageRef} className="glass-stage combined-stage" aria-label="Filmshow introduction">
        <div className="glass-stage__sticky">
          <div className="glass-stage__media glass-stage__media--film" aria-hidden="true" />
          <div className="glass-stage__media glass-stage__media--show" aria-hidden="true" />
          <p className="glass-stage__meta glass-stage__meta--top">Short film</p>
          <p className="glass-stage__meta glass-stage__meta--bottom">Live performance</p>
          <div className="glass-word" aria-label="Filmshow">
            <span className="glass-word__film">FILM</span><span className="glass-word__show">SHOW</span>
          </div>
          <div className="glass-definitions" aria-hidden="true">
            <p><span>FILM</span>Short cinema</p>
            <p><span>SHOW</span>Live performance</p>
          </div>
          <div className="glass-stage__resolve">
            <p>SHOW / FILM / SHOW / FILM</p>
            <a href="#movement-1">Continue <span>↓</span></a>
          </div>
        </div>
      </section>

      <div className="sequence-beats">
        {beats.map((beat, index) => (
          <section key={`${beat.kind}-${index}`} id={`movement-${index + 1}`} data-sequence-beat={index} className={`sequence-beat sequence-beat--${beat.kind.toLowerCase()}`}>
            <div className="sequence-beat__image-wrap">
              <div className="sequence-beat__image" style={{ backgroundImage: `url(${beat.image})` }} />
            </div>
            <div className="sequence-beat__copy">
              <span className="sequence-beat__count">{String(index + 1).padStart(2, "0")}</span>
              <h2>{beat.kind}</h2>
              <h3>{beat.label}</h3>
              <p>{beat.detail}</p>
            </div>
          </section>
        ))}
      </div>

      <section className="sequence-end">
        <p className="concept-kicker">Filmshow · Brooklyn</p>
        <h2>This is not<br />a festival.</h2>
        <div className="sequence-end__actions">
          <Link href="/tickets">Tickets <span>↗</span></Link>
          <a href="https://filmfreeway.com/TheFilmShow" target="_blank" rel="noreferrer">Submit a film <span>↗</span></a>
          <Link href="/">Filmshow.org <span>→</span></Link>
        </div>
      </section>
    </main>
  );
}
