"use client";

import {
  getCurrentPagePath,
  trackGoogleAnalyticsEvent,
  trackOutboundClick,
} from "@/lib/google-analytics-events";
import { LUMA_EVENT_ID } from "@/lib/luma";
import { useEffect } from "react";

function cleanText(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() || "";
}

function getLinkText(link: HTMLAnchorElement) {
  return (
    cleanText(link.textContent) ||
    cleanText(link.getAttribute("aria-label")) ||
    cleanText(link.getAttribute("title")) ||
    link.href
  );
}

function getUrl(href: string) {
  try {
    return new URL(href, window.location.href);
  } catch {
    return null;
  }
}

function isLumaTicketLink(link: HTMLAnchorElement, url: URL) {
  const hostname = url.hostname.replace(/^www\./, "");

  return (
    (hostname === "luma.com" || hostname === "lu.ma") &&
    (link.dataset.lumaAction === "checkout" ||
      link.dataset.lumaEventId === LUMA_EVENT_ID ||
      url.pathname.includes(LUMA_EVENT_ID))
  );
}

function isFilmFreewayLink(url: URL) {
  return (
    url.hostname.replace(/^www\./, "") === "filmfreeway.com" &&
    url.pathname.toLowerCase().includes("thefilmshow")
  );
}

function isInstagramLink(url: URL) {
  return (
    url.hostname.replace(/^www\./, "") === "instagram.com" &&
    url.pathname.toLowerCase().includes("thiskeenan")
  );
}

function isExternalUrl(url: URL) {
  return url.origin !== window.location.origin;
}

function isBrevoSignupForm(form: HTMLFormElement) {
  return (
    form.id.startsWith("sib-form-") ||
    form.action.includes("sibforms.com")
  );
}

export function GoogleAnalyticsInteractions() {
  useEffect(() => {
    const startedSignupForms = new WeakSet<HTMLFormElement>();

    const handleClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const link = target?.closest<HTMLAnchorElement>("a[href]");
      if (!link) return;

      const url = getUrl(link.href);
      if (!url) return;

      const linkText = getLinkText(link);

      if (isLumaTicketLink(link, url)) {
        trackOutboundClick("ticket_cta_click", url.href, linkText, {
          luma_event_id: link.dataset.lumaEventId || LUMA_EVENT_ID,
        });
        trackOutboundClick("ticket_checkout_click", url.href, linkText, {
          luma_event_id: link.dataset.lumaEventId || LUMA_EVENT_ID,
        });
        return;
      }

      if (isFilmFreewayLink(url)) {
        trackOutboundClick("submission_cta_click", url.href, linkText);
        return;
      }

      if (isInstagramLink(url)) {
        trackOutboundClick("instagram_click", url.href, linkText);
        return;
      }

      if (isExternalUrl(url)) {
        trackOutboundClick("outbound_link_click", url.href, linkText);
      }
    };

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      const form = target?.closest<HTMLFormElement>("form");

      if (!form || !isBrevoSignupForm(form) || startedSignupForms.has(form)) {
        return;
      }

      startedSignupForms.add(form);
      trackGoogleAnalyticsEvent("email_signup_start", {
        form_id: form.id,
        form_action: form.action,
        form_placement: form.id.replace("sib-form-", "") || undefined,
        page_path: getCurrentPagePath(),
      });
    };

    const handleSubmit = (event: SubmitEvent) => {
      if (!(event.target instanceof HTMLFormElement)) return;

      const form = event.target;
      if (!isBrevoSignupForm(form)) return;

      trackGoogleAnalyticsEvent("email_signup_complete", {
        form_id: form.id,
        form_action: form.action,
        form_placement: form.id.replace("sib-form-", "") || undefined,
        page_path: getCurrentPagePath(),
      });
    };

    document.addEventListener("click", handleClick, true);
    document.addEventListener("focusin", handleFocusIn, true);
    document.addEventListener("submit", handleSubmit, true);

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("focusin", handleFocusIn, true);
      document.removeEventListener("submit", handleSubmit, true);
    };
  }, []);

  return null;
}
