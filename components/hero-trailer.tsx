"use client";

import {
  getCurrentPagePath,
  trackGoogleAnalyticsEvent,
} from "@/lib/google-analytics-events";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

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
  const hasTrackedPlayRef = useRef(false);
  const hasTrackedCompleteRef = useRef(false);
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
    if (!video) return;

    let unmounted = false;

    const playVideoWithSound = async () => {
      video.muted = false;
      video.defaultMuted = false;
      video.volume = 1;
      try {
        await video.play();
      } catch {
        if (unmounted) return;

        video.muted = true;
        video.defaultMuted = true;
        await video.play().catch(() => {});
      }
    };

    const ensurePlayback = () => {
      if (!document.hidden && video.paused) {
        void playVideoWithSound();
      }
    };

    const unlockAudio = () => {
      if (!unmounted) void playVideoWithSound();
    };

    void playVideoWithSound();
    video.addEventListener("canplay", ensurePlayback);
    window.addEventListener("pageshow", ensurePlayback);
    window.addEventListener("focus", ensurePlayback);
    document.addEventListener("pointerdown", unlockAudio, { capture: true });
    document.addEventListener("keydown", unlockAudio, { capture: true });
    document.addEventListener("touchstart", unlockAudio, { capture: true, passive: true });
    window.addEventListener("wheel", unlockAudio, { passive: true });

    return () => {
      unmounted = true;
      video.removeEventListener("canplay", ensurePlayback);
      window.removeEventListener("pageshow", ensurePlayback);
      window.removeEventListener("focus", ensurePlayback);
      document.removeEventListener("pointerdown", unlockAudio, { capture: true });
      document.removeEventListener("keydown", unlockAudio, { capture: true });
      document.removeEventListener("touchstart", unlockAudio, { capture: true });
      window.removeEventListener("wheel", unlockAudio);
      video.pause();
    };
  }, []);

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

      video.muted = false;
      video.defaultMuted = false;
      video.volume = 1;
      video.play().catch(() => {});
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pagehide", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pagehide", handleVisibility);
    };
  }, []);

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
              <video
                ref={videoRef}
                className="hero-trailer-video"
                src={videoSrc}
                aria-label="Filmshow trailer"
                autoPlay
                loop
                playsInline
                preload="auto"
                poster={fallbackImage}
              />
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
                Filmshow is a live show that combines award winning short films
                and live experimental theater to create an entirely new peice of
                art. A filmshow if you will.
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
