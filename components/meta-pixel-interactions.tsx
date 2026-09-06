"use client";

import { LUMA_EVENT_ID } from "@/lib/luma";
import { useEffect } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function MetaPixelInteractions() {
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const link = target?.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;

      const isLumaCheckout =
        link.dataset.lumaAction === "checkout" ||
        link.dataset.lumaEventId === LUMA_EVENT_ID;

      if (!isLumaCheckout) return;

      window.fbq?.("track", "InitiateCheckout", {
        content_name: "Filmshow Vol. 1",
        content_ids: [LUMA_EVENT_ID],
        content_type: "product",
      });
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  return null;
}
