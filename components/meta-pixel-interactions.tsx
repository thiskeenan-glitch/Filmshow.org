"use client";

import { LUMA_EVENT_ID } from "@/lib/luma";
import { useEffect } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

type LumaPurchaseMessage = {
  type?: string;
  transaction_id?: string;
  value?: number | string;
  currency?: string;
};

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

    const handleMessage = (event: MessageEvent<LumaPurchaseMessage>) => {
      if (event.origin !== "https://luma.com") return;
      if (event.data?.type !== "luma:purchase") return;

      const value = Number(event.data.value ?? 0);
      const currency = (event.data.currency || "USD").toUpperCase();
      const common = {
        content_name: "Filmshow Vol. 1",
        content_ids: [LUMA_EVENT_ID],
        content_type: "product",
        order_id: event.data.transaction_id,
      };

      if (Number.isFinite(value) && value > 0) {
        window.fbq?.("track", "Purchase", {
          ...common,
          value,
          currency,
        });
      } else {
        window.fbq?.("track", "CompleteRegistration", common);
      }
    };

    document.addEventListener("click", handleClick, true);
    window.addEventListener("message", handleMessage);

    return () => {
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return null;
}
