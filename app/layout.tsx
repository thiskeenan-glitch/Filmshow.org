import type { Metadata } from "next";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://filmshow.org"),
  title: "Film Show | NYC Short Film Event",
  description:
    "A live NYC short film event with a jury selected 1st Place, audience voted 2nd and 3rd, live performances, and $6,000 cash.",
  openGraph: {
    title: "Film Show | NYC Short Film Event",
    description:
      "A live NYC short film event with a jury selected 1st Place, audience voted 2nd and 3rd, live performances, and $6,000 cash.",
    images: [
      {
        url: "/images/tfs-poster.png",
        width: 2160,
        height: 2160,
        alt: "Film Show Volume 1 poster",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Film Show | NYC Short Film Event",
    description:
      "A live NYC short film event with a jury selected 1st Place, audience voted 2nd and 3rd, live performances, and $6,000 cash.",
    images: ["/images/tfs-poster.png"],
  },
  icons: {
    icon: [
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
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
      </body>
    </html>
  );
}
