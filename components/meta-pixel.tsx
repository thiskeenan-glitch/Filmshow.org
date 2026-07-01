"use client";

import Script from "next/script";
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

  return (
    <>
      <Script
        id="meta-pixel-base"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
