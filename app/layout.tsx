import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://filmshow.org"),
  title: "Film Show | NYC Short Film Event",
  description:
    "A live NYC short film event with a jury selected 1st Place, audience voted 2nd and 3rd, live performances, and a $6,000 cash prize.",
  openGraph: {
    title: "Film Show | NYC Short Film Event",
    description:
      "A live NYC short film event with a jury selected 1st Place, audience voted 2nd and 3rd, live performances, and a $6,000 cash prize.",
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
    title: "Film Show | NYC Short Film Event",
    description:
      "A live NYC short film event with a jury selected 1st Place, audience voted 2nd and 3rd, live performances, and a $6,000 cash prize.",
    images: ["/images/optimized/tfs-poster-social.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.png", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
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
        <SiteHeader />
        {children}
        <SiteFooter />
        <Analytics />
      </body>
    </html>
  );
}
