"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type HeroTrailerProps = {
  backgroundImage?: string;
  desktopBackgroundImage?: string;
  fallbackImage: string;
  logoImage: string;
  videoSrc: string;
};

export function HeroTrailer({
  backgroundImage,
  desktopBackgroundImage,
  fallbackImage,
  logoImage,
  videoSrc,
}: HeroTrailerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
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
        video.muted = false;
        video.defaultMuted = false;
        video.volume = 1;
        await video.play();
      } catch {
        if (!unmounted) return;
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
      const hero = document.getElementById("top");
      const heroHeight = hero?.getBoundingClientRect().height || window.innerHeight;
      const fadeDistance = Math.max(1, heroHeight * 0.72);
      const nextVolume = Math.max(0, Math.min(1, 1 - window.scrollY / fadeDistance));

      if (videoRef.current) {
        videoRef.current.volume = nextVolume;
      }

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
        <picture>
          <source
            media="(min-width: 768px)"
            srcSet={desktopBackgroundImage ?? backgroundImage ?? fallbackImage}
          />
          <img
            src={backgroundImage ?? fallbackImage}
            alt=""
            className="hero-trailer-backdrop-image"
          />
        </picture>
      </div>

      <div className="hero-trailer-stage">
        {!isMobileViewport ? (
          <div className="hero-trailer-logo-row">
            <div className="hero-trailer-wordmark-wrap">
              <Image
                src={logoImage}
                alt="Filmshow"
                width={3400}
                height={1362}
                priority
                sizes="(max-width: 767px) 260px, 36rem"
                className="hero-trailer-wordmark"
              />
            </div>
          </div>
        ) : null}
        <div className="hero-trailer-frame-shell">
          <div className="hero-trailer-copy">
            <div className="hero-trailer-copy-block">
              <h1 className="hero-trailer-headline">
                <span>THIS IS NOT</span>
                <span>A SCREENING.</span>
              </h1>
              <p className="hero-trailer-mobile-intro">
                <span>Short films.</span>{" "}
                <span>Live performances.</span>
              </p>
              <p className="hero-trailer-subheadline hero-trailer-subheadline--desktop">
                <span>Short films.</span>{" "}
                <span>Live performances.</span>
              </p>
              <p className="hero-trailer-description hero-trailer-description--desktop">
                A curated live show featuring short films and live
                performances.
              </p>
            </div>
          </div>
          <div className="hero-trailer-frame">
            <div className="hero-trailer-media">
              {!reducedMotion ? (
                <video
                  ref={videoRef}
                  className="hero-trailer-video"
                  src={videoSrc}
                  aria-label="Filmshow trailer"
                  autoPlay
                  loop
                  playsInline
                  preload="metadata"
                  poster={fallbackImage}
                />
              ) : (
                <Image
                  src={fallbackImage}
                  alt="Filmshow trailer still"
                  width={1200}
                  height={1200}
                  sizes="(max-width: 767px) 86vw, 500px"
                  className="hero-trailer-poster"
                />
              )}
              <div className="hero-trailer-overlay" aria-hidden="true" />
            </div>
          </div>
          <p className="hero-trailer-description hero-trailer-description--mobile">
            A curated live show featuring short films and live
            performances.
          </p>
        </div>
      </div>
    </section>
  );
}
