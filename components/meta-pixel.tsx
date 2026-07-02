"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const FILMFREEWAY_SUBMISSION_URL = "https://filmfreeway.com/TheFilmShow";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: Window["fbq"];
  }
}

function isFilmFreewaySubmissionLink(href: string) {
  return href.startsWith(FILMFREEWAY_SUBMISSION_URL);
}

export function MetaPixel() {
  const pathname = usePathname();
  const lastTrackedUrlRef = useRef<string | null>(null);

  useEffect(() => {
    const url = `${pathname}${window.location.search}`;

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
