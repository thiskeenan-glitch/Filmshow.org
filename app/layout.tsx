import type { Metadata } from "next";
import "./globals.css";
import { GoogleAnalytics } from "@next/third-parties/google";
import Script from "next/script";
import { Suspense } from "react";
import { GoogleAnalyticsInteractions } from "@/components/google-analytics-interactions";
import { GoogleAnalyticsPageView } from "@/components/google-analytics-page-view";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
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
      { url: "/favicon-red-cowboy.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-red-cowboy-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-red-cowboy-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-red-cowboy-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-red-cowboy-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-red-cowboy-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon-red-cowboy.ico" }],
    apple: [{ url: "/favicon-red-cowboy-180x180.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head />
      <body className="antialiased">
        <RouteScrollManager />
        <SiteHeader />
        {children}
        <SiteFooter />
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
