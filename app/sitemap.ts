import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["/", "/tickets", "/archive", "/archive/v1", "/archive/toy-gun-premiere"].map((path) => ({
    url: absoluteUrl(path),
    lastModified: "2026-10-15",
    priority: path === "/" ? 1 : 0.8,
  }));
}
