import type { Metadata } from "next";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import { Suspense } from "react";
import { GoogleAnalyticsInteractions } from "@/components/google-analytics-interactions";
import { GoogleAnalyticsPageView } from "@/components/google-analytics-page-view";
import { MetaPixel } from "@/components/meta-pixel";
import { MetaPixelInteractions } from "@/components/meta-pixel-interactions";
import { RouteScrollManager } from "@/components/route-scroll-manager";
import { GA_MEASUREMENT_ID, IS_GA_ENABLED } from "@/lib/analytics";
import {
  BRAND_NAME,
  DOMAIN_NAME,
  SITE_URL,
  createPageMetadata,
  routeMetadata,
} from "@/lib/seo";

const verification = {
  ...(process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : {}),
  ...(process.env.BING_SITE_VERIFICATION
    ? { other: { "msvalidate.01": process.env.BING_SITE_VERIFICATION } }
    : {}),
};

export const metadata: Metadata = {
  ...createPageMetadata(routeMetadata.home),
  metadataBase: new URL(SITE_URL),
  applicationName: BRAND_NAME,
  category: "event",
  keywords: [
    "Filmshow",
    "Filmshow NYC",
    "short film event",
    "short film events NYC",
    "film screenings Brooklyn",
    "live film events New York",
    "short film showcase NYC",
    "independent film events Brooklyn",
    "things to do in Brooklyn",
    "NYC film event",
    "live performances",
    "FilmFreeway",
    "independent filmmakers",
    "short film submissions",
    "audience-voted film events",
    "experimental theater and film events",
  ],
  manifest: "/site.webmanifest",
  creator: BRAND_NAME,
  publisher: BRAND_NAME,
  verification,
  other: {
    "og:domain": DOMAIN_NAME,
  },
  icons: {
    icon: [
      { url: "/favicon-red-dot.ico", sizes: "any" },
      { url: "/favicon-red-dot.svg", type: "image/svg+xml" },
      { url: "/favicon-red-dot-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-red-dot-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-red-dot-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-red-dot-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-red-dot-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon-red-dot.ico" }],
    apple: [{ url: "/favicon-red-dot-180x180.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head />
      <body className="antialiased">
        <RouteScrollManager />
        {children}
        <MetaPixel />
        <MetaPixelInteractions />
        {IS_GA_ENABLED ? <GoogleAnalytics gaId={GA_MEASUREMENT_ID} /> : null}
        <Script
          id="luma-checkout"
          src="https://embed.lu.ma/checkout-button.js"
          strategy="afterInteractive"
        />
        {IS_GA_ENABLED ? (
          <>
            <GoogleAnalyticsInteractions />
            <Suspense fallback={null}>
              <GoogleAnalyticsPageView />
            </Suspense>
          </>
        ) : null}
      </body>
    </html>
  );
}
