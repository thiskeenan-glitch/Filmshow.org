"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const META_PIXEL_ID = "1365964182304663";
const FILMFREEWAY_SUBMISSION_URL = "https://filmfreeway.com/TheFilmShow";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: Window["fbq"];
  }
}

type FbqBootstrap = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  loaded?: boolean;
  push: (args: unknown[]) => void;
  queue: unknown[][];
  version?: string;
};

function isFilmFreewaySubmissionLink(href: string) {
  return href.startsWith(FILMFREEWAY_SUBMISSION_URL);
}

function ensureMetaPixelLoaded() {
  if (typeof window === "undefined") return;

  const existing = document.getElementById("meta-pixel-base");
  if (!existing) {
    const marker = document.createElement("script");
    marker.id = "meta-pixel-base";
    marker.text = "/* Meta Pixel bootstrap marker */";
    document.head.appendChild(marker);
  }

  if (typeof window.fbq === "function") return;

  const fbq: FbqBootstrap = function (...args: unknown[]) {
    if (typeof fbq.callMethod === "function") {
      fbq.callMethod(...args);
      return;
    }

    fbq.queue.push(args);
  };

  fbq.push = (args: unknown[]) => {
    fbq.queue.push(Array.isArray(args) ? args : [args]);
  };
  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";

  window.fbq = fbq;
  window._fbq = fbq;

  if (!document.getElementById("meta-pixel-network")) {
    const networkScript = document.createElement("script");
    networkScript.id = "meta-pixel-network";
    networkScript.async = true;
    networkScript.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(networkScript);
  }

  window.fbq("init", META_PIXEL_ID);
  window.fbq("track", "PageView");
}

export function MetaPixel() {
  const pathname = usePathname();
  const lastTrackedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    ensureMetaPixelLoaded();
  }, []);

  useEffect(() => {
    const url = `${pathname}${window.location.search}`;

    ensureMetaPixelLoaded();

    if (!window.fbq || lastTrackedUrlRef.current === url) {
      return;
    }

    if (lastTrackedUrlRef.current !== null) {
      window.fbq("track", "PageView");
    }

    lastTrackedUrlRef.current = url;
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const trigger = target.closest("a, button");
      if (!(trigger instanceof HTMLElement)) return;

      const explicitSubmitTrigger = trigger.dataset.metaPixelEvent === "submit-button-click";
      const href =
        trigger instanceof HTMLAnchorElement
          ? trigger.href
          : trigger.getAttribute("data-submit-href") ?? "";

      if (!explicitSubmitTrigger && !href) return;
      if (!explicitSubmitTrigger && !isFilmFreewaySubmissionLink(href)) return;

      window.fbq?.("trackCustom", "SubmitButtonClick", {
        destination: FILMFREEWAY_SUBMISSION_URL,
      });
    };

    document.addEventListener("click", handleClick, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
    };
  }, []);

  return <span hidden aria-hidden="true" data-meta-pixel-root />;
}
