"use client";

import {
  getCurrentPagePath,
  trackGoogleAnalyticsEvent,
} from "@/lib/google-analytics-events";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type HeroTrailerProps = {
  backgroundImage?: string;
  desktopBackgroundImage?: string;
  fallbackImage: string;
  logoImage: string;
  videoSrc: string;
};

const NEWS_URL = "/news";

export function HeroTrailer({
  backgroundImage,
  desktopBackgroundImage,
  fallbackImage,
  logoImage,
  videoSrc,
}: HeroTrailerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const trailerVolumeRef = useRef(1);
  const audioAllowedRef = useRef(false);
  const hasTrackedPlayRef = useRef(false);
  const hasTrackedCompleteRef = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isHeroDimmed, setIsHeroDimmed] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  const updateTrailerAudio = useCallback(() => {
    const hero = document.getElementById("top");
    const heroRect = hero?.getBoundingClientRect();
    const heroHeight = Math.max(
      1,
      heroRect?.height || hero?.offsetHeight || window.innerHeight,
    );
    const fadeDistance = Math.max(1, heroHeight * 0.72);
    const isPastHero = heroRect ? heroRect.bottom <= 24 : window.scrollY >= heroHeight;
    const nextVolume = isPastHero
      ? 0
      : Math.max(0, Math.min(1, 1 - window.scrollY / fadeDistance));
    const shouldMute = nextVolume <= 0.02;
    const video = videoRef.current;

    trailerVolumeRef.current = nextVolume;

    if (video) {
      video.volume = nextVolume;
      video.muted = shouldMute || !audioAllowedRef.current;
      video.defaultMuted = video.muted;
    }

    setIsHeroDimmed(window.scrollY > 90);

    return nextVolume;
  }, []);

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

    const playVideo = async (withSound: boolean) => {
      const nextVolume = updateTrailerAudio();

      try {
        audioAllowedRef.current = withSound && nextVolume > 0.02;
        video.muted = !audioAllowedRef.current;
        video.defaultMuted = video.muted;
        video.volume = nextVolume;
        await video.play();
      } catch {
        if (unmounted) return;

        audioAllowedRef.current = false;
        video.muted = true;
        video.defaultMuted = true;
        video.volume = 0;
        await video.play().catch(() => {});
      }
    };

    const unlockAudio = () => {
      if (unmounted) return;
      void playVideo(true);
    };

    void playVideo(false);
    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });
    window.addEventListener("touchstart", unlockAudio, { once: true, passive: true });

    return () => {
      unmounted = true;
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      window.removeEventListener("touchstart", unlockAudio);
      video.pause();
    };
  }, [reducedMotion, updateTrailerAudio]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const trackPlay = () => {
      if (hasTrackedPlayRef.current) return;
      hasTrackedPlayRef.current = true;
      trackGoogleAnalyticsEvent("trailer_play", {
        page_path: getCurrentPagePath(),
        video_src: videoSrc,
      });
    };

    const trackProgress = () => {
      if (
        hasTrackedCompleteRef.current ||
        !Number.isFinite(video.duration) ||
        video.duration <= 0
      ) {
        return;
      }

      if (video.currentTime / video.duration >= 0.95) {
        hasTrackedCompleteRef.current = true;
        trackGoogleAnalyticsEvent("trailer_complete", {
          page_path: getCurrentPagePath(),
          video_src: videoSrc,
        });
      }
    };

    video.addEventListener("play", trackPlay);
    video.addEventListener("timeupdate", trackProgress);

    return () => {
      video.removeEventListener("play", trackPlay);
      video.removeEventListener("timeupdate", trackProgress);
    };
  }, [videoSrc]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleVisibility = () => {
      if (document.hidden) {
        video.pause();
        return;
      }

      if (!reducedMotion) {
        updateTrailerAudio();
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
              updateTrailerAudio();
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
  }, [reducedMotion, updateTrailerAudio]);

  useEffect(() => {
    const handleScroll = () => {
      updateTrailerAudio();
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [updateTrailerAudio]);

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
            width={2000}
            height={1333}
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
                  muted
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
          <div className="hero-trailer-copy">
            <div className="hero-trailer-copy-block">
              <h1 className="hero-trailer-headline">
                <span>IT&apos;S IN</span>
                <span>
                  THE <em className="hero-trailer-emphasis">NAME.</em>
                </span>
              </h1>
              <p className="hero-trailer-description">
                Filmshow is a live show that combines short films from local
                filmmakers and live experimental theater to create a glimpse
                into the underground scene of New York City.
              </p>
                <a
                  href={NEWS_URL}
                  className="hero-trailer-news-link"
                >
                Read the article
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
