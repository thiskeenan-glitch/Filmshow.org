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
        rootMargin: "0px 0px -6% 0px",
        threshold: 0.1,
      },
    );

    revealItems.forEach((item) => observer.observe(item));

    return () => {
      observer.disconnect();
      document.removeEventListener("click", handleScrollTopClick);
    };
  }, []);

  return null;
}
