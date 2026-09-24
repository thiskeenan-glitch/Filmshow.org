"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { KeyboardEvent, UIEvent } from "react";

type LineupFilm = {
  title: string;
  poster: string;
  width: number;
  height: number;
  director: string;
  writer: string;
  year: string;
  runtime: string;
  country: string;
  language: string;
  genre: string;
  logline: string;
};

type LineupPosterMarqueeProps = {
  films: readonly LineupFilm[];
};

export function LineupPosterMarquee({ films }: LineupPosterMarqueeProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const goToFilm = (index: number) => {
    const rail = railRef.current;
    if (!rail) return;

    const nextIndex = (index + films.length) % films.length;
    const slide = rail.children.item(nextIndex) as HTMLElement | null;
    if (!slide) return;

    setActiveIndex(nextIndex);
    rail.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
  };

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const rail = event.currentTarget;
    const slides = Array.from(rail.children) as HTMLElement[];
    if (!slides.length) return;

    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    slides.forEach((slide, index) => {
      const distance = Math.abs(slide.offsetLeft - rail.scrollLeft);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    setActiveIndex((current) =>
      current === nearestIndex ? current : nearestIndex,
    );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    event.preventDefault();
    goToFilm(activeIndex + (event.key === "ArrowRight" ? 1 : -1));
  };

  return (
    <div className="lineup-carousel">
      <div
        ref={railRef}
        className="lineup-carousel-rail"
        role="region"
        aria-label="Filmshow Vol. 1 film lineup"
        aria-live="polite"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onScroll={handleScroll}
      >
        {films.map((film, index) => (
          <article
            className="lineup-film-slide"
            key={film.title}
            aria-label={`${index + 1} of ${films.length}: ${film.title}`}
          >
            <div className="lineup-film-poster-wrap">
              <Image
                src={film.poster}
                alt={`${film.title} official poster`}
                draggable={false}
                width={film.width}
                height={film.height}
                sizes="(min-width: 1024px) 35vw, 82vw"
                className="lineup-film-poster"
                priority={index === 0}
              />
            </div>

            <div className="lineup-film-details">
              <p className="lineup-film-number">0{index + 1} / 0{films.length}</p>
              <h3>{film.title}</h3>
              <p className="lineup-film-byline">A film by {film.director}</p>

              <dl className="lineup-film-facts">
                <div>
                  <dt>Year</dt>
                  <dd>{film.year}</dd>
                </div>
                <div>
                  <dt>Runtime</dt>
                  <dd>{film.runtime}</dd>
                </div>
                <div>
                  <dt>Origin</dt>
                  <dd>{film.country}</dd>
                </div>
                <div>
                  <dt>Genre</dt>
                  <dd>{film.genre}</dd>
                </div>
                <div>
                  <dt>Language</dt>
                  <dd>{film.language}</dd>
                </div>
                <div>
                  <dt>Written by</dt>
                  <dd>{film.writer}</dd>
                </div>
              </dl>

              <div className="lineup-film-logline">
                <p>Logline</p>
                <p>{film.logline}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="lineup-carousel-controls">
        <p aria-hidden="true">
          0{activeIndex + 1} <span>/ 0{films.length}</span>
        </p>
        <div>
          <button
            type="button"
            onClick={() => goToFilm(activeIndex - 1)}
            aria-label="Show previous film"
          >
            <span aria-hidden="true">←</span> Previous
          </button>
          <button
            type="button"
            onClick={() => goToFilm(activeIndex + 1)}
            aria-label="Show next film"
          >
            Next <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
