"use client";

import {
  getCurrentPagePath,
  trackGoogleAnalyticsEvent,
} from "@/lib/google-analytics-events";
import { useEffect } from "react";

export function OriginalsSuccessAnalytics() {
  useEffect(() => {
    trackGoogleAnalyticsEvent("originals_payment_completed", {
      page_path: getCurrentPagePath(),
    });
  }, []);

  return null;
}
