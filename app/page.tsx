import { BrevoSignup } from "@/components/brevo-signup";
import { ButtonLink } from "@/components/button-link";
import { HeroTrailer } from "@/components/hero-trailer";
import { MotionEffects } from "@/components/motion-effects";
import { PhotoGallery } from "@/components/photo-gallery";
import { PlasticCard } from "@/components/plastic-card";
import Image from "next/image";
import type { CSSProperties } from "react";

const LUMA_EVENT_URL = "https://luma.com/wqhep4p3";
const FILMFREEWAY_URL = "https://filmfreeway.com/TheFilmShow";
const SITE_URL = "https://www.filmshow.org";
const LOGO_IMAGE = "/images/official-tfs-logo.png";
const SITE_DESCRIPTION =
  "Six films. One night. $6,000 in cash. A curated live show for short films and live performances.";
const HERO_TRAILER_VIDEO = "/videos/filmshow-web-trailer-cropped.mov";
const HERO_TRAILER_FALLBACK = "/images/hero/filmshow-trailer-fallback.jpg";
const HERO_BACKGROUND_IMAGE = "/images/optimized/gallery-space.jpg";
const HERO_DESKTOP_BACKGROUND_IMAGE = "/images/audience-wrapped-in-plastic.jpg";
const FOUNDER_IMAGE = "/images/founder-carl-marks.jpg";
const TICKETS_MOBILE_IMAGE = "/images/tickets-mobile-room.jpg";
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
    square: true,
  },
];

const cashAwards = [
  ["First Prize", "$3,000", "Selected by judges."],
  ["Second Prize", "$2,000", "Audience vote."],
  ["Third Prize", "$1,000", "Audience vote."],
];

const filmmakerDetails = [
  ["Runtime", "15 minutes or under"],
  ["Genres", "All genres welcome"],
  ["Location", "Filmmakers anywhere can submit"],
  ["Selected films", "6 to 8, depending on length of live show"],
  ["Prize", "$6,000 cash prize"],
  ["Event", "New York City"],
];

const whySubmitBody = [
  "I started Filmshow after screening one of my own short films.",
  "Instead of a traditional screening, we built an entire show around it. Experimental theater. Surprises. The film became part of an experience instead of just another screening.",
  "That night made me realize something.",
  "I've spent years on the festival circuit, and too often incredible short films end up buried inside long blocks where audiences drift in and out, filmmakers wait for their own film to play, and everyone politely applauds before heading home.",
  "I wanted to build something I'd actually want to attend.",
  "Filmshow isn't a film festival. It's a live show built around just six exceptional films. Every selection gets the attention it deserves. Every audience member is there for the entire experience. And every filmmaker has a chance to compete for meaningful prize money.",
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
        submitHref={FILMFREEWAY_URL}
        videoSrc={HERO_TRAILER_VIDEO}
      />

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

      <section id="prize" className="section-pad cash-section">
        <div className="container-page relative z-10">
          <SectionLabel number="02" title="The prize" />
          <div className="cash-content">
            <div className="max-w-sm" data-reveal="text">
              <p className="cash-total-number text-stone-100">
                $6,000
              </p>
              <p className="copy-wide mt-4 text-sm text-red-300">
                Cash prize
              </p>
              <p className="mt-8 max-w-md text-sm leading-6 text-stone-500">
                Cash prizes are awarded to the winning filmmakers the night of the event.
              </p>
            </div>
            <div className="cash-cards">
              {cashAwards.map(([place, amount, copy], index) => (
                <PlasticCard
                  key={place}
                  className="cash-card"
                  style={{ "--reveal-delay": `${index * 90}ms` } as CSSProperties}
                  reveal
                >
                  <p className="copy-wide small-label text-red-300">{place}</p>
                  <p className="cash-card-number mt-7 text-stone-100">
                    {amount}
                  </p>
                  <p className="body-copy mt-6 text-stone-300">{copy}</p>
                </PlasticCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="submit" className="section-pad submit-section">
        <div className="container-page">
          <SectionLabel number="03" title="Filmmakers" />
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
                  Submit Your Film
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
          <BrevoSignup placement="submit" />
        </div>
      </section>

      <div className="submit-why-fade" aria-hidden="true" />

      <section id="why-submit" className="section-pad why-submit-section">
        <div className="container-page">
          <SectionLabel number="04" title="Why submit" />
          <div className="why-submit-grid">
            <div className="why-submit-intro" data-reveal="text">
              <p className="section-kicker max-w-xl text-stone-100">
                Why Submit?
              </p>
              <div className="mt-10">
                <ButtonLink href={FILMFREEWAY_URL} variant="secondary" newTab>
                  Submit Your Film
                </ButtonLink>
              </div>
            </div>
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

      <section className="section-pad" id="tickets">
        <div className="container-page">
          <SectionLabel number="05" title="TICKETS" />
          <div className="tickets-content max-w-3xl" data-reveal="text">
            <figure className="tickets-mobile-photo-wrap">
              <Image
                src={TICKETS_MOBILE_IMAGE}
                alt="Filmshow performance inside the New York space"
                width={900}
                height={1200}
                sizes="(max-width: 767px) 38vw, 1px"
                className="tickets-mobile-photo"
              />
            </figure>
            <p className="section-kicker text-stone-100">
              Be in the room.
            </p>
            <p className="body-copy mt-8 max-w-xl text-stone-300">
              Vol. 1 happens October 8th in New York City. Tickets include
              the full live screening, performances, audience voting, and the
              winner announcement.
            </p>
            <p className="body-copy mt-5 max-w-xl text-stone-500">
              Guest list and check-in are handled through Luma.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={LUMA_EVENT_URL} newTab>
                Get Tickets
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
