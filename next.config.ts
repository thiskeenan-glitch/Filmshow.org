import type { NextConfig } from "next";

const isPreviewDeployment =
  process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "192.168.1.154"],
  async redirects() {
    return [
      { source: "/v2", destination: "/", permanent: true },
      { source: "/v2/:path*", destination: "/:path*", permanent: true },
      { source: "/about", destination: "/#experience", permanent: true },
      { source: "/experience", destination: "/#experience", permanent: true },
      { source: "/how-it-works", destination: "/#experience", permanent: true },
      { source: "/faq", destination: "/#take-part", permanent: true },
      { source: "/team", destination: "/archive/toy-gun-premiere", permanent: true },
      { source: "/news", destination: "/archive", permanent: true },
      { source: "/sponsors", destination: "/#partners", permanent: true },
      { source: "/gallery", destination: "/#photos", permanent: true },
      { source: "/submit", destination: "https://filmfreeway.com/TheFilmShow", permanent: true },
      { source: "/concepts/:path*", destination: "/", permanent: true },
      { source: "/originals", destination: "/#take-part", permanent: true },
      { source: "/live", destination: "/tickets", permanent: true },
      { source: "/join", destination: "/#take-part", permanent: true },
      { source: "/tickets/entered", destination: "/tickets", permanent: true },
    ];
  },
  async headers() {
    if (!isPreviewDeployment) return [];

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
