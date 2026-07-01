import type { Metadata } from "next";
import "./globals.css";
import { MetaPixel } from "@/components/meta-pixel";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { RouteScrollManager } from "@/components/route-scroll-manager";

const META_PIXEL_ID = "1365964182304663";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.filmshow.org"),
  title: "Film Show | Live Short Film Event in NYC",
  description:
    "Film Show is a live short-film event in New York City featuring curated short films, live performances, and a $6,000 cash prize.",
  alternates: {
    canonical: "https://www.filmshow.org",
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "Film Show | Live Short Film Event in NYC",
    description:
      "Film Show is a live short-film event in New York City featuring curated short films, live performances, and a $6,000 cash prize.",
    url: "https://www.filmshow.org",
    siteName: "Film Show",
    images: [
      {
        url: "/images/optimized/tfs-poster-social.jpg",
        width: 1200,
        height: 1200,
        alt: "Film Show Volume 1 poster",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Film Show | Live Short Film Event in NYC",
    description:
      "Film Show is a live short-film event in New York City featuring curated short films, live performances, and a $6,000 cash prize.",
    images: ["/images/optimized/tfs-poster-social.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon-cowboy.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-cowboy-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-cowboy-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-cowboy-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-cowboy-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-cowboy-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon-cowboy.ico" }],
    apple: [{ url: "/favicon-cowboy-180x180.png", sizes: "180x180", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        <MetaPixel />
        <RouteScrollManager />
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
