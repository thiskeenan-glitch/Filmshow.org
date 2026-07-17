import { ButtonLink } from "@/components/button-link";
import { HeroTrailer } from "@/components/hero-trailer";
import { MotionEffects } from "@/components/motion-effects";
import { PhotoGallery } from "@/components/photo-gallery";
import { PlasticCard } from "@/components/plastic-card";
import Image from "next/image";
import type { CSSProperties } from "react";

const FILMFREEWAY_URL = "https://filmfreeway.com/TheFilmShow";
const SITE_URL = "https://www.filmshow.org";
const LOGO_IMAGE = "/images/official-tfs-logo.png";
const SITE_DESCRIPTION =
  "Short films. Live performances.";
const HERO_TRAILER_VIDEO = "/videos/website-background.mov";
const FILMSHOW_POSTER_IMAGE = "/images/what-is-filmshow-placeholder.png";
const HERO_TRAILER_FALLBACK = FILMSHOW_POSTER_IMAGE;
const HERO_BACKGROUND_IMAGE = "/images/hero/the-space-hero.jpg";
const HERO_DESKTOP_BACKGROUND_IMAGE = "/images/hero/the-space-hero.jpg";
const FOUNDER_IMAGE = "/images/founder-carl-marks.jpg";
const SOCIAL_URLS: string[] = [];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Filmshow",
      url: SITE_URL,
      logo: `${SITE_URL}${LOGO_IMAGE}`,
      description: SITE_DESCRIPTION,
      ...(SOCIAL_URLS.length ? { sameAs: SOCIAL_URLS } : {}),
    },
    {
      "@type": "Event",
      name: "Filmshow Vol. 1",
      startDate: "2026-10-08",
      eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
      eventStatus: "https://schema.org/EventScheduled",
      location: {
        "@type": "Place",
        name: "New York City",
        address: {
          "@type": "PostalAddress",
          addressLocality: "New York City",
          addressRegion: "NY",
          addressCountry: "US",
        },
      },
      organizer: {
        "@type": "Organization",
        name: "Filmshow",
        url: SITE_URL,
      },
      url: SITE_URL,
      image: [`${SITE_URL}/images/filmshow-social-logo-black-bg.png`],
      description: SITE_DESCRIPTION,
    },
  ],
};

const galleryPhotos = [
  {
    src: "/images/optimized/gallery-space.jpg",
    alt: "Filmshow event space before the screening",
    position: "center",
    caption: "Before lights.",
    portrait: true,
  },
  {
    src: "/images/the-team.jpg",
    alt: "Filmshow team gathered near a Toy Gun poster",
    position: "center 58%",
    portrait: true,
    fallbackSrc: "/images/optimized/gallery-space.jpg",
  },
  {
    src: "/images/optimized/gallery-ladder.jpg",
    alt: "Live performance with a ladder and red costumes",
    position: "center",
    caption: "Live performances.",
    portrait: true,
  },
  {
    src: "/images/lots-of-people.jpg",
    alt: "A full room watching short films in New York City",
    position: "center",
    fallbackSrc: "/images/optimized/gallery-space.jpg",
  },
  {
    src: "/images/optimized/gallery-high-five.jpg",
    alt: "Performers jumping for a high five beside a ladder",
    position: "center",
    portrait: true,
  },
  {
    src: "/images/the-crowd.jpg",
    alt: "Audience watching a film screening in a dark room",
    position: "center",
    portrait: true,
    fallbackSrc: "/images/optimized/gallery-high-five.jpg",
  },
  {
    src: "/images/optimized/gallery-3-people.jpg",
    alt: "Three performers on stage under a projected play symbol",
    position: "center",
    caption: "A room full of strangers.",
    square: true,
  },
];

const filmmakerDetails = [
  ["Runtime", "15 minutes or under"],
  ["Genres", "All genres welcome"],
  ["Location", "Filmmakers anywhere can submit"],
  ["Selected films", "Short films selected for the live show"],
  ["Event", "New York City"],
];

const whySubmitBody = [
  "I started Filmshow after screening one of my own short films.",
  "Instead of a traditional screening, we built an entire show around it. Experimental theater. Surprises. The film became part of an experience instead of just another screening.",
  "That night made me realize something.",
  "I've spent years on the festival circuit, and too often incredible short films end up buried inside long blocks where audiences drift in and out, filmmakers wait for their own film to play, and everyone politely applauds before heading home.",
  "I wanted to build something I'd actually want to attend.",
  "Filmshow isn't a film festival. It's a live show built around exceptional short films. Every selection gets the attention it deserves. Every audience member is there for the entire experience.",
  "It's the kind of show I'd want my own film to play in.",
];

function Divider() {
  return (
    <div className="container-page">
      <div className="poster-divider" data-reveal="line" />
    </div>
  );
}

function SectionLabel({ number, title }: { number: string; title: string }) {
  return (
    <div className="section-label mb-14 grid grid-cols-[2.5rem_1fr] items-center gap-4 md:grid-cols-[4rem_auto_1fr] md:gap-6" data-reveal="section-label">
      <p className="copy-wide small-label text-red-500">{number}</p>
      <h2 className="copy-wide text-sm text-stone-300">{title}</h2>
      <div className="hidden h-px bg-stone-100/10 md:block" />
    </div>
  );
}

export default function Home() {
  return (
    <main className="home-page-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <MotionEffects />
      <HeroTrailer
        backgroundImage={HERO_BACKGROUND_IMAGE}
        desktopBackgroundImage={HERO_DESKTOP_BACKGROUND_IMAGE}
        fallbackImage={HERO_TRAILER_FALLBACK}
        logoImage={LOGO_IMAGE}
        videoSrc={HERO_TRAILER_VIDEO}
      />

      <section id="what-is-this" className="section-pad what-is-filmshow-section">
        <div className="container-page">
          <div className="what-is-filmshow-content">
            <div
              className="what-is-filmshow-label section-label"
              data-reveal="section-label"
            >
              <p className="copy-wide small-label text-red-500">01</p>
              <h2 className="copy-wide text-sm text-stone-300">
                What is Filmshow?
              </h2>
            </div>
            <div className="what-is-filmshow-copy" data-reveal="text">
              <p className="section-kicker text-stone-100">
                Filmshow is a live cinema experience.
              </p>
              <div className="what-is-filmshow-body">
                <p className="body-large text-stone-300">
                  We bring together remarkable short films, live performances, and
                  an audience that loves movies. Every screening is curated. Every
                  season is different.
                </p>
                <p className="body-large text-stone-300">
                  At the end of the night, the audience decides the winning film.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="filmshow-poster-section" aria-label="Filmshow poster">
        <Image
          src={FILMSHOW_POSTER_IMAGE}
          alt="Filmshow poster"
          width={3250}
          height={3250}
          sizes="(max-width: 767px) 82vw, 760px"
          className="filmshow-poster-image"
        />
      </section>

      <section id="photos" className="photo-gallery-section section-pad">
        <div className="container-page">
          <div className="grid gap-5 md:grid-cols-[0.72fr_1.28fr] md:items-end">
            <div data-reveal="text">
              <p className="copy-wide small-label text-red-300">Photos</p>
              <h2 className="section-kicker mt-5 text-stone-100">
                Inside the space.
              </h2>
            </div>
            <p className="body-large max-w-2xl text-stone-300" data-reveal="text">
              An industrial New York space built for films, performances, and a crowd.
            </p>
          </div>
        </div>
        <PhotoGallery photos={galleryPhotos} />
      </section>

      <Divider />

      <section id="submit" className="section-pad submit-section">
        <div className="container-page">
          <SectionLabel number="02" title="Filmmakers" />
          <div className="submit-intro" data-reveal="text">
            <div>
              <p className="section-kicker text-stone-100">
                Submit your film.
              </p>
              <p className="body-copy mt-8 max-w-xl text-stone-300">
                Seen in a room. On a big screen.
              </p>
              <p className="copy-wide mt-6 text-xs text-red-300">
                Vol. 1 | 10.8.26 | NYC
              </p>
              <div className="mt-10">
                <ButtonLink href={FILMFREEWAY_URL} newTab>
                  Submit Film
                </ButtonLink>
              </div>
            </div>
          </div>
          <div className="submit-facts">
            {filmmakerDetails.map(([label, value], index) => (
              <PlasticCard
                key={label}
                className="submit-fact-card"
                style={{ "--reveal-delay": `${index * 55}ms` } as CSSProperties}
                reveal
              >
                <p className="copy-wide small-label text-red-300">{label}</p>
                <p className="submit-fact-value">
                  {value}
                </p>
              </PlasticCard>
            ))}
          </div>
        </div>
      </section>

      <div className="submit-why-fade" aria-hidden="true" />

      <section id="why-submit" className="section-pad why-submit-section">
        <div className="container-page">
          <SectionLabel number="03" title="Why Filmshow" />
          <div className="why-submit-grid">
            <figure className="why-submit-founder" data-reveal="photo">
              <div className="why-submit-founder-image-wrap">
                <Image
                  src={FOUNDER_IMAGE}
                  alt="Black-and-white portrait of Keenan Gray, Filmshow founder and director"
                  width={1400}
                  height={1272}
                  sizes="(max-width: 767px) 256px, 280px"
                  className="why-submit-founder-image"
                />
              </div>
              <figcaption className="why-submit-founder-caption">
                <span>Keenan Gray</span>
                <span>Founder &amp; Director</span>
              </figcaption>
              <a
                href="https://www.instagram.com/thiskeenan"
                target="_blank"
                rel="noreferrer"
                className="why-submit-instagram"
                aria-label="Open Keenan Gray on Instagram"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="why-submit-instagram-icon"
                >
                  <rect x="4" y="4" width="16" height="16" rx="5" />
                  <circle cx="12" cy="12" r="3.5" />
                  <circle cx="17" cy="7" r="1" />
                </svg>
                <span>@thiskeenan</span>
              </a>
            </figure>
            <div className="why-submit-list why-submit-story" data-reveal="text">
              {whySubmitBody.map((paragraph, index) => (
                <p
                  key={paragraph}
                  className={`why-submit-story-copy ${
                    index === 2 || index === 4 || index === whySubmitBody.length - 1
                      ? "text-stone-100"
                      : "text-stone-300"
                  }`}
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Divider />
    </main>
  );
}
