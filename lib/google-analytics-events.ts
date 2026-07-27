"use client";

import { GA_MEASUREMENT_ID, IS_GA_ENABLED } from "@/lib/analytics";
import { sendGAEvent } from "@next/third-parties/google";

export type GoogleAnalyticsEventName =
  | "buy_tickets_click"
  | "submit_film_click"
  | "email_signup"
  | "instagram_click"
  | "originals_form_started"
  | "originals_form_completed"
  | "originals_checkout_started"
  | "originals_payment_completed";

type AnalyticsParams = Record<string, string | number | boolean | undefined>;

export function getCurrentPagePath() {
  if (typeof window === "undefined") return undefined;

  return `${window.location.pathname}${window.location.search}`;
}

export function trackGoogleAnalyticsEvent(
  eventName: GoogleAnalyticsEventName,
  params: AnalyticsParams = {},
) {
  if (!IS_GA_ENABLED || typeof window === "undefined") return;

  sendGAEvent("event", eventName, {
    send_to: GA_MEASUREMENT_ID,
    ...params,
  });
}

export function trackOutboundClick(
  eventName: Exclude<GoogleAnalyticsEventName, "email_signup">,
  linkUrl: string,
  linkText: string,
  params: AnalyticsParams = {},
) {
  trackGoogleAnalyticsEvent(eventName, {
    link_url: linkUrl,
    link_text: linkText,
    page_path: getCurrentPagePath(),
    ...params,
  });
}
