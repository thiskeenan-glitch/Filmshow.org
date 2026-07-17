import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { RouteScrollManager } from "@/components/route-scroll-manager";

const siteTitle = "Filmshow | This Is Not A Festival";
const siteDescription =
  "Short films. Live performances.";
const socialImage = "/images/filmshow-social-logo-black-bg.png";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.filmshow.org"),
  applicationName: "Filmshow",
  title: siteTitle,
  description: siteDescription,
  keywords: [
    "Filmshow",
    "short film event",
    "NYC film event",
    "live performances",
    "FilmFreeway",
    "independent filmmakers",
  ],
  alternates: {
    canonical: "https://www.filmshow.org",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    url: "https://www.filmshow.org",
    siteName: "Filmshow",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: socialImage,
        width: 4000,
        height: 4000,
        alt: "Filmshow logo on a black background",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [socialImage],
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
      </body>
    </html>
  );
}
