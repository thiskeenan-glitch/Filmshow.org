import type { NextConfig } from "next";

const isPreviewDeployment =
  process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "192.168.1.154"],
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
