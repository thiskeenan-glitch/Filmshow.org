"use client";

import { ArrowIcon } from "@/components/arrow-icon";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { filmshowV2Config } from "@/lib/filmshow-v2-config";

export function GlassExperience() {
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
      const resolve = Math.min(1, Math.max(0, (progress - 0.91) / 0.07));
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

  const edition = filmshowV2Config.editions[0];

  return (
    <main className="glass-theater">
      <section ref={stageRef} className="glass-stage" aria-label="Filmshow wordmark introduction">
        <div className="glass-stage__sticky">
          <div className="glass-stage__media glass-stage__media--film" aria-hidden="true" />
          <div className="glass-stage__media glass-stage__media--show" aria-hidden="true" />
          <p className="glass-stage__meta glass-stage__meta--top">Brooklyn / New York</p>
          <p className="glass-stage__meta glass-stage__meta--bottom">Cinema + live performance</p>
          <div className="glass-word" aria-label="Filmshow">
            <span className="glass-word__film">FILM</span><span className="glass-word__show">SHOW</span>
          </div>
          <div className="glass-definitions" aria-hidden="true">
            <p><span>FILM</span> Extraordinary short cinema, chosen for the room.</p>
            <p><span>SHOW</span> Theater, clowning, circus, comedy, and interruption.</p>
          </div>
          <div className="glass-stage__resolve">
            <p>This is not a festival.</p>
            <a href="#glass-home">Enter the room <span><ArrowIcon direction="down" /></span></a>
          </div>
          <span className="glass-stage__counter" aria-hidden="true">01 — 03</span>
        </div>
      </section>

      <section id="glass-home" className="glass-home">
        <div className="glass-home__hero">
          <p className="concept-kicker">Twice yearly / Brooklyn</p>
          <h1>Short cinema.<br />Live interruption.<br />One room.</h1>
          <p className="glass-home__intro">
            Filmshow pairs exceptional short films with theater, clowning, circus,
            comedy, and immersive performance. The screen is only half the story.
          </p>
          <div className="glass-home__actions">
            <Link href={filmshowV2Config.tickets.href}>
              {filmshowV2Config.tickets.label} <span><ArrowIcon direction="up-right" /></span>
            </Link>
            <a href={filmshowV2Config.submissions.href} target="_blank" rel="noreferrer">
              {filmshowV2Config.submissions.label} <span><ArrowIcon direction="up-right" /></span>
            </a>
          </div>
        </div>

        <div className="glass-cadence" aria-label="The Filmshow cadence">
          {["SHOW", "FILM", "SHOW", "FILM"].map((word, index) => (
            <div key={`${word}-${index}`}>
              <span>0{index + 1}</span>
              <strong>{word}</strong>
              <p>{word === "FILM" ? "The image holds the room." : "The room breaks the frame."}</p>
            </div>
          ))}
        </div>

        <section className="glass-archive">
          <div className="glass-archive__image" role="img" aria-label="Audience gathered at Filmshow Volume 1" />
          <div className="glass-archive__copy">
            <p className="concept-kicker">Past shows / Archive 001</p>
            <h2>{edition.label}</h2>
            <p>{edition.date}<br />{edition.location}</p>
            <div className="glass-archive__placeholder">
              <span>Archive in progress</span>
              <p>Hero film, selected films, credits, highlights, press, and awards will appear here when verified materials are available.</p>
            </div>
          </div>
        </section>

        <section className="glass-close">
          <p className="concept-kicker">The next volume</p>
          <h2>Come for the film.<br />Stay for whatever happens next.</h2>
          <div>
            <Link href="/">Explore the current site <span><ArrowIcon direction="right" /></span></Link>
            <Link href="/concepts/doors">Try another entrance <span><ArrowIcon direction="up-right" /></span></Link>
          </div>
        </section>
      </section>
    </main>
  );
}
