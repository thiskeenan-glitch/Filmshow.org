"use client";

import { useEffect } from "react";

export function MotionEffects() {
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const revealItems = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));

    const handleScrollTopClick = (event: MouseEvent) => {
      const trigger = (event.target as Element | null)?.closest<HTMLAnchorElement>("[data-scroll-top]");
      if (!trigger) return;

      const href = trigger.getAttribute("href");
      if (!href) return;

      const targetUrl = new URL(href, window.location.href);
      const isSamePage = targetUrl.pathname === window.location.pathname;

      if (!isSamePage) return;

      event.preventDefault();
      window.scrollTo({
        top: 0,
        behavior: reduceMotion ? "auto" : "smooth",
      });

      if (window.location.hash !== "#top") {
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#top`);
      }
    };

    document.addEventListener("click", handleScrollTopClick);

    if (reduceMotion) {
      revealItems.forEach((item) => item.classList.add("is-visible"));
      return () => document.removeEventListener("click", handleScrollTopClick);
    }

    document.documentElement.classList.add("motion-effects-ready");

    let filmScrollTimer: number | null = null;
    let lastFilmPopAt = 0;
    const filmPopTimers = new Set<number>();
    const filmPopLayer = document.createElement("div");
    filmPopLayer.className = "film-scroll-pop-layer";
    filmPopLayer.setAttribute("aria-hidden", "true");
    document.body.appendChild(filmPopLayer);

    const createFilmScrollPops = () => {
      const now = window.performance.now();
      if (now - lastFilmPopAt < 120) return;
      lastFilmPopAt = now;

      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      const popCount = isMobile
        ? 1 + Math.floor(Math.random() * 2)
        : 2 + Math.floor(Math.random() * 3);

      for (let index = 0; index < popCount; index += 1) {
        const pop = document.createElement("span");
        const isSpeck = index > 0 && Math.random() > (isMobile ? 0.82 : 0.38);
        const size = isSpeck
          ? 3 + Math.random() * 11
          : isMobile
            ? 34 + Math.random() * 82
            : 22 + Math.random() * 76;
        const duration = isMobile
          ? 480 + Math.random() * 420
          : 340 + Math.random() * 460;
        const delay = Math.random() * 130;

        pop.className = `film-scroll-pop${isMobile ? " is-mobile" : ""}${isSpeck ? " is-speck" : ""}`;
        pop.style.setProperty("--film-pop-x", `${3 + Math.random() * 94}vw`);
        pop.style.setProperty("--film-pop-y", `${3 + Math.random() * 94}vh`);
        pop.style.setProperty("--film-pop-size", `${size}px`);
        const opacity = isMobile
          ? 0.1 + Math.random() * 0.18
          : 0.18 + Math.random() * 0.26;
        pop.style.setProperty("--film-pop-opacity", `${opacity}`);
        pop.style.setProperty("--film-pop-fade-opacity", `${opacity * 0.72}`);
        pop.style.setProperty("--film-pop-duration", `${duration}ms`);
        pop.style.setProperty("--film-pop-delay", `${delay}ms`);
        pop.style.setProperty("--film-pop-drift-x", `${-18 + Math.random() * 36}px`);
        pop.style.setProperty("--film-pop-drift-y", `${-14 + Math.random() * 28}px`);

        filmPopLayer.appendChild(pop);

        const removalTimer = window.setTimeout(() => {
          pop.remove();
          filmPopTimers.delete(removalTimer);
        }, duration + delay + 120);
        filmPopTimers.add(removalTimer);
      }
    };

    const markFilmAsScrolling = () => {
      document.documentElement.classList.add("is-film-scrolling");
      createFilmScrollPops();

      if (filmScrollTimer !== null) {
        window.clearTimeout(filmScrollTimer);
      }

      filmScrollTimer = window.setTimeout(() => {
        document.documentElement.classList.remove("is-film-scrolling");
        filmScrollTimer = null;
      }, 280);
    };

    document.addEventListener("scroll", markFilmAsScrolling, true);
    window.addEventListener("wheel", markFilmAsScrolling, { passive: true });
    window.addEventListener("touchmove", markFilmAsScrolling, { passive: true });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -4% 0px",
        threshold: 0.01,
      },
    );

    revealItems.forEach((item) => observer.observe(item));

    const revealFallback = window.setTimeout(() => {
      revealItems.forEach((item) => item.classList.add("is-visible"));
    }, 1400);

    return () => {
      window.clearTimeout(revealFallback);
      if (filmScrollTimer !== null) {
        window.clearTimeout(filmScrollTimer);
      }
      filmPopTimers.forEach((timer) => window.clearTimeout(timer));
      filmPopTimers.clear();
      filmPopLayer.remove();
      observer.disconnect();
      document.documentElement.classList.remove("motion-effects-ready");
      document.documentElement.classList.remove("is-film-scrolling");
      document.removeEventListener("scroll", markFilmAsScrolling, true);
      window.removeEventListener("wheel", markFilmAsScrolling);
      window.removeEventListener("touchmove", markFilmAsScrolling);
      document.removeEventListener("click", handleScrollTopClick);
    };
  }, []);

  return null;
}
