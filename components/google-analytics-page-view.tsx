"use client";

import { GA_MEASUREMENT_ID } from "@/lib/analytics";
import { sendGAEvent } from "@next/third-parties/google";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export function GoogleAnalyticsPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasTrackedInitialPage = useRef(false);

  useEffect(() => {
    if (!pathname) return;

    if (!hasTrackedInitialPage.current) {
      hasTrackedInitialPage.current = true;
      return;
    }

    const queryString = searchParams?.toString();
    const pagePath = queryString ? `${pathname}?${queryString}` : pathname;

    sendGAEvent("config", GA_MEASUREMENT_ID, {
      page_path: pagePath,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, searchParams]);

  return null;
}
