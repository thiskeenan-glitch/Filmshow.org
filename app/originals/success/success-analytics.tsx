"use client";

import {
  getCurrentPagePath,
  trackGoogleAnalyticsEvent,
} from "@/lib/google-analytics-events";
import { useEffect } from "react";

export function OriginalsSuccessAnalytics() {
  useEffect(() => {
    trackGoogleAnalyticsEvent("submission_complete", {
      page_path: getCurrentPagePath(),
      submission_type: "originals_pitch",
    });
  }, []);

  return null;
}
