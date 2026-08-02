import type { Metadata, MetadataRoute } from "next";
import { LUMA_EVENT_URL } from "./luma";

const PRODUCTION_SITE_URL = "https://www.filmshow.org";

function resolveSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (!configuredUrl) return PRODUCTION_SITE_URL;

  try {
    const url = new URL(configuredUrl);
    return url.origin;
  } catch {
    return PRODUCTION_SITE_URL;
  }
}

export const SITE_URL = resolveSiteUrl();
export const BRAND_NAME = "Filmshow";
export const DOMAIN_NAME = "filmshow.org";
export const BRAND_LINE = "It's in the name.";
export const PRIMARY_SOCIAL_TITLE = "It's in the name. | Filmshow";
export const PRIMARY_DESCRIPTION =
  "Filmshow combines short films from local filmmakers and live experimental theater to create a glimpse into the underground scene of New York City.";
export const LONG_DESCRIPTION =
  "Filmshow is a live cultural event and creative platform in Brooklyn, New York, combining local short films, live experimental theater, and an audience gathered in the room.";

export const currentEvent = {
  name: "Filmshow Vol. 1",
  path: "/tickets",
  dateLabel: "Vol. 1 | 10.3.26 | Brooklyn, NYC",
  startDate: "2026-10-03",
  locationName: "Brooklyn, New York",
  description:
    "Filmshow Vol. 1 brings short films from local filmmakers and live experimental theater into one Brooklyn room.",
  ticketUrl: LUMA_EVENT_URL,
} as const;

export const externalLinks = {
  tickets: LUMA_EVENT_URL,
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
  lastModified: string;
};

export const routeMetadata = {
  home: {
    path: "/",
    title: "Filmshow | Short Films and Experimental Theater in NYC",
    socialTitle: PRIMARY_SOCIAL_TITLE,
    description: PRIMARY_DESCRIPTION,
    priority: 1,
    lastModified: "2026-07-28",
  },
  tickets: {
    path: "/tickets",
    title: "Tickets | Filmshow",
    socialTitle: "Filmshow Tickets | Brooklyn Live Cinema Event",
    description:
      "Get tickets for Filmshow Vol. 1, a Brooklyn live cinema event featuring local short films, live performance, and an audience in the room.",
    priority: 0.9,
    lastModified: "2026-07-28",
  },
  howItWorks: {
    path: "/how-it-works",
    title: "How Filmshow Works | Filmshow",
    socialTitle: "How Filmshow Works",
    description:
      "Learn how Filmshow selects short films, presents live experimental theater, and brings audiences together for a Brooklyn live cinema event.",
    priority: 0.8,
    lastModified: "2026-07-28",
  },
  about: {
    path: "/about",
    title: "About Filmshow | Brooklyn Live Cinema",
    socialTitle: "About Filmshow",
    description:
      "Filmshow is a Brooklyn live cinema experience founded by Keenan Gray, combining independent short films, performers, and a real room.",
    priority: 0.7,
    lastModified: "2026-07-28",
  },
  sponsors: {
    path: "/sponsors",
    title: "Sponsors | Filmshow",
    socialTitle: "Sponsor Filmshow",
    description:
      "Sponsor Filmshow, a Brooklyn live cinema event built for filmmakers, performers, audiences, and the creative community.",
    priority: 0.4,
    lastModified: "2026-07-28",
  },
  originals: {
    path: "/originals",
    title: "Grant | Filmshow",
    socialTitle: "Filmshow Grant",
    description:
      "Pitch Filmshow an original short-film idea for the chance to receive $2,000 in production funding, support from Bluebird, and a premiere in New York City.",
    priority: 0.7,
    lastModified: "2026-07-28",
  },
} satisfies Record<string, SeoRoute>;

export const publicRoutes = Object.values(routeMetadata);

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

export function createPageMetadata(route: SeoRoute): Metadata {
  const canonical = absoluteUrl(route.path);
  const imageUrl = absoluteUrl(socialImage.path);
  const socialTitle = route.socialTitle ?? route.title;

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
      siteName: BRAND_NAME,
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
  return publicRoutes.map((route) => ({
    url: absoluteUrl(route.path),
    lastModified: new Date(route.lastModified),
    changeFrequency: route.path === "/" ? "weekly" : "monthly",
    priority: route.priority,
  }));
}

function organizationJsonLd() {
  return {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: BRAND_NAME,
    url: SITE_URL,
    logo: absoluteUrl("/images/official-tfs-logo.png"),
    image: absoluteUrl(socialImage.path),
    description: LONG_DESCRIPTION,
    sameAs: [externalLinks.founderInstagram],
    founder: {
      "@id": `${SITE_URL}/#keenan-gray`,
    },
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
  };
}

function founderJsonLd() {
  return {
    "@type": "Person",
    "@id": `${SITE_URL}/#keenan-gray`,
    name: "Keenan Gray",
    jobTitle: "Founder and Director",
    sameAs: [externalLinks.founderInstagram],
  };
}

function websiteJsonLd() {
  return {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    name: BRAND_NAME,
    url: SITE_URL,
    description: PRIMARY_DESCRIPTION,
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
  };
}

function eventSeriesJsonLd() {
  return {
    "@type": "EventSeries",
    "@id": `${SITE_URL}/#event-series`,
    name: BRAND_NAME,
    url: SITE_URL,
    description: LONG_DESCRIPTION,
    organizer: {
      "@id": `${SITE_URL}/#organization`,
    },
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
  };
}

function currentEventJsonLd() {
  return {
    "@type": "Event",
    "@id": `${SITE_URL}/#filmshow-vol-1`,
    name: currentEvent.name,
    description: currentEvent.description,
    url: absoluteUrl(currentEvent.path),
    image: [absoluteUrl(socialImage.path)],
    startDate: currentEvent.startDate,
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    location: {
      "@type": "Place",
      name: currentEvent.locationName,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Brooklyn",
        addressRegion: "NY",
        addressCountry: "US",
      },
    },
    organizer: {
      "@id": `${SITE_URL}/#organization`,
    },
    superEvent: {
      "@id": `${SITE_URL}/#event-series`,
    },
    offers: {
      "@type": "Offer",
      url: currentEvent.ticketUrl,
    },
  };
}

export function buildBaseJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationJsonLd(),
      founderJsonLd(),
      websiteJsonLd(),
      eventSeriesJsonLd(),
      currentEventJsonLd(),
      {
        "@type": "WebPage",
        "@id": `${SITE_URL}/#webpage`,
        url: SITE_URL,
        name: routeMetadata.home.title,
        description: routeMetadata.home.description,
        isPartOf: {
          "@id": `${SITE_URL}/#website`,
        },
        about: [
          {
            "@id": `${SITE_URL}/#organization`,
          },
          {
            "@id": `${SITE_URL}/#event-series`,
          },
        ],
        primaryEntity: {
          "@id": `${SITE_URL}/#event-series`,
        },
      },
    ],
  };
}

function webPageJsonLd(route: SeoRoute) {
  return {
    "@type": "WebPage",
    "@id": `${absoluteUrl(route.path)}#webpage`,
    url: absoluteUrl(route.path),
    name: route.title,
    description: route.description,
    isPartOf: {
      "@id": `${SITE_URL}/#website`,
    },
    publisher: {
      "@id": `${SITE_URL}/#organization`,
    },
  };
}

export function buildWebPageJsonLd(route: SeoRoute) {
  return {
    "@context": "https://schema.org",
    ...webPageJsonLd(route),
  };
}

export function buildEventPageJsonLd(route: SeoRoute) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      webPageJsonLd(route),
      organizationJsonLd(),
      eventSeriesJsonLd(),
      currentEventJsonLd(),
    ],
  };
}

export function buildFaqPageJsonLd(
  route: SeoRoute,
  faqs: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      webPageJsonLd(route),
      {
        "@type": "FAQPage",
        "@id": `${absoluteUrl(route.path)}#faq`,
        url: absoluteUrl(route.path),
        mainEntity: faqs.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };
}
