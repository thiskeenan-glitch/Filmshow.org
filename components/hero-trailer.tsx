"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type HeroTrailerProps = {
  fallbackImage: string;
  learnMoreHref: string;
  logoImage: string;
  submitHref: string;
  videoSrc: string;
};

export function HeroTrailer({
  fallbackImage,
  learnMoreHref,
  logoImage,
  submitHref,
  videoSrc,
}: HeroTrailerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);
  const [isHeroDimmed, setIsHeroDimmed] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);

    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);

    return () => {
      mediaQuery.removeEventListener("change", updatePreference);
    };
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => setIsMobileViewport(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);

    return () => {
      mediaQuery.removeEventListener("change", updateViewport);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reducedMotion) return;

    let unmounted = false;

    const playVideo = async () => {
      try {
        video.muted = true;
        video.defaultMuted = true;
        await video.play();
      } catch {
        if (!unmounted) {
          setAutoplayBlocked(true);
        }
      }
    };

    playVideo();

    return () => {
      unmounted = true;
      video.pause();
    };
  }, [reducedMotion]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVisibility = () => {
      if (document.hidden) {
        video.pause();
        return;
      }

      if (!reducedMotion) {
        video.play().catch(() => {});
      }
    };

    const menu = document.getElementById("mobile-menu");
    const observer =
      menu
        ? new MutationObserver(() => {
            if (menu.classList.contains("is-open")) {
              video.pause();
              return;
            }

            if (!document.hidden && !reducedMotion) {
              video.play().catch(() => {});
            }
          })
        : null;

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", handleVisibility);

    if (observer && menu) {
      observer.observe(menu, { attributes: true, attributeFilter: ["class"] });
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", handleVisibility);
      observer?.disconnect();
    };
  }, [reducedMotion]);

  useEffect(() => {
    const handleScroll = () => {
      setIsHeroDimmed(window.scrollY > 90);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <section
      id="top"
      className={`hero-trailer-shell ${
        reducedMotion ? "is-reduced-motion" : "is-animated"
      } ${isHeroDimmed ? "is-logo-dim" : ""}`}
    >
      <div className="hero-trailer-backdrop" aria-hidden="true">
        <img
          src={fallbackImage}
          alt=""
          className="hero-trailer-backdrop-image"
        />
      </div>

      <div className="hero-trailer-stage">
        {!isMobileViewport ? (
          <div className="hero-trailer-logo-row">
            <div className="hero-trailer-wordmark-wrap">
              <img
                src={logoImage}
                alt="Film Show"
                className="hero-trailer-wordmark"
              />
            </div>
          </div>
        ) : null}
        <div className="hero-trailer-frame-shell">
          <div className="hero-trailer-frame">
            <div className="hero-trailer-media">
              {!reducedMotion && !autoplayBlocked ? (
                <video
                  ref={videoRef}
                  className="hero-trailer-video"
                  src={videoSrc}
                  aria-label="Film Show trailer"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={fallbackImage}
                />
              ) : (
                <img
                  src={fallbackImage}
                  alt="Film Show trailer still"
                  className="hero-trailer-poster"
                />
              )}
              <div className="hero-trailer-overlay" aria-hidden="true" />
            </div>
          </div>
          <div className="hero-trailer-copy">
            <div className="hero-trailer-copy-block">
              <h1 className="hero-trailer-headline">
                <span>THIS IS NOT</span>
                <span>A FESTIVAL.</span>
              </h1>
              <p className="hero-trailer-subheadline">
                <span>Six films.</span>
                <span>One night.</span>
                <span>$6,000 in cash.</span>
              </p>
              <p className="hero-trailer-description hero-trailer-description--desktop">
                A curated live show featuring six short films and live
                performances.
              </p>
            </div>
          </div>
          <p className="hero-trailer-description hero-trailer-description--mobile">
            A curated live show featuring six short films and live
            performances.
          </p>
          <div className="hero-trailer-actions">
            <Link
              href={submitHref}
              target="_blank"
              rel="noopener noreferrer"
              className="hero-trailer-button hero-trailer-button-primary"
            >
              Submit Your Film
            </Link>
            <Link
              href={learnMoreHref}
              className="hero-trailer-button hero-trailer-button-secondary"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
