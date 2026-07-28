"use client";

import { GA_MEASUREMENT_ID, IS_GA_ENABLED } from "@/lib/analytics";
import { sendGAEvent } from "@next/third-parties/google";

export type GoogleAnalyticsEventName =
  | "ticket_cta_click"
  | "ticket_checkout_click"
  | "submission_cta_click"
  | "submission_form_start"
  | "submission_complete"
  | "email_signup_start"
  | "email_signup_complete"
  | "trailer_play"
  | "trailer_complete"
  | "instagram_click"
  | "outbound_link_click";

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
  eventName: Exclude<
    GoogleAnalyticsEventName,
    "email_signup_start" | "email_signup_complete"
  >,
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
