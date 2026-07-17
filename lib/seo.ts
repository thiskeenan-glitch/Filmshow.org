import type { Metadata, MetadataRoute } from "next";

export const SITE_URL = "https://www.filmshow.org";
export const BRAND_NAME = "Filmshow";
export const DOMAIN_NAME = "filmshow.org";
export const PRIMARY_SOCIAL_TITLE = "Not A Film Screening. A Film Show.";
export const PRIMARY_DESCRIPTION =
  "Short films, live performances, and a room full of strangers.";
export const LONG_DESCRIPTION =
  "Filmshow is a live short-film event in Brooklyn featuring curated films, live performances, audience participation, and a cash prize.";

export const externalLinks = {
  tickets: "https://luma.com/wqhep4p3",
  submit: "https://filmfreeway.com/TheFilmShow",
  founderInstagram: "https://www.instagram.com/thiskeenan",
} as const;

export const socialImage = {
  path: "/images/filmshow-social-preview.jpg",
  width: 1200,
  height: 1200,
  alt: "Filmshow logo on a black background.",
  type: "image/jpeg",
} as const;

export type SeoRoute = {
  path: string;
  title: string;
  socialTitle?: string;
  description: string;
  priority: number;
};

export const routeMetadata = {
  home: {
    path: "/",
    title: "Not A Film Screening. A Film Show. | Filmshow NYC",
    description:
      "Filmshow is a live short-film event in Brooklyn with curated films, live performances, audience voting, and a cash prize.",
    priority: 1,
  },
  tickets: {
    path: "/tickets",
    title: "Filmshow Tickets | Live Short Films in Brooklyn",
    description:
      "Get tickets to Filmshow, a live short-film event in Brooklyn with curated films, performances, audience participation, and a cash prize.",
    priority: 0.9,
  },
  howItWorks: {
    path: "/how-it-works",
    title: "What Is Filmshow? | Live Short-Film Event NYC",
    description:
      "Filmshow combines short films, live performances, audience participation, and a room full of strangers for one night in Brooklyn.",
    priority: 0.8,
  },
  about: {
    path: "/about",
    title: "Why Filmshow Exists | Independent Film in Brooklyn",
    description:
      "Filmshow creates a live, audience-first home for short films, filmmakers, performers, and people who want to experience something together.",
    priority: 0.7,
  },
  sponsors: {
    path: "/sponsors",
    title: "Filmshow Sponsors | Brooklyn Short-Film Event",
    description:
      "Sponsor Filmshow, a Brooklyn short-film event built for filmmakers, audiences, performers, and the creative community.",
    priority: 0.4,
  },
} satisfies Record<string, SeoRoute>;

export const publicRoutes = Object.values(routeMetadata);

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

export function createPageMetadata(route: SeoRoute): Metadata {
  const canonical = absoluteUrl(route.path);
  const imageUrl = absoluteUrl(socialImage.path);
  const socialTitle = route.socialTitle ?? PRIMARY_SOCIAL_TITLE;

  return {
    title: route.title,
    description: route.description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: socialTitle,
      description: route.description,
      url: canonical,
      siteName: DOMAIN_NAME,
      type: "website",
      locale: "en_US",
      images: [
        {
          url: imageUrl,
          width: socialImage.width,
          height: socialImage.height,
          alt: socialImage.alt,
          type: socialImage.type,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description: route.description,
      images: [
        {
          url: imageUrl,
          alt: socialImage.alt,
        },
      ],
    },
  };
}

export function createSitemapRoutes(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-07-17");

  return publicRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified,
    changeFrequency: route.path === "/" ? "weekly" : "monthly",
    priority: route.priority,
  }));
}

export function buildBaseJsonLd() {
  const organizationId = `${SITE_URL}/#organization`;
  const websiteId = `${SITE_URL}/#website`;
  const eventId = `${SITE_URL}/#event-filmshow-vol-1`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: BRAND_NAME,
        url: SITE_URL,
        logo: absoluteUrl("/images/official-tfs-logo.png"),
        image: absoluteUrl(socialImage.path),
        description: LONG_DESCRIPTION,
        location: {
          "@type": "Place",
          name: "Brooklyn, New York",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Brooklyn",
            addressRegion: "NY",
            addressCountry: "US",
          },
        },
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: BRAND_NAME,
        url: SITE_URL,
        description: PRIMARY_DESCRIPTION,
        publisher: {
          "@id": organizationId,
        },
      },
      {
        "@type": "Event",
        "@id": eventId,
        name: "Filmshow Vol. 1",
        startDate: "2026-10-08",
        eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
        eventStatus: "https://schema.org/EventScheduled",
        location: {
          "@type": "Place",
          name: "Brooklyn, New York venue TBA",
          address: {
            "@type": "PostalAddress",
            addressLocality: "Brooklyn",
            addressRegion: "NY",
            addressCountry: "US",
          },
        },
        image: [absoluteUrl(socialImage.path)],
        description: LONG_DESCRIPTION,
        organizer: {
          "@id": organizationId,
        },
        url: SITE_URL,
        offers: {
          "@type": "Offer",
          url: externalLinks.tickets,
          availability: "https://schema.org/InStock",
        },
      },
    ],
  };
}

export function buildBreadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
