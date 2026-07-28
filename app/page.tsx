import { ButtonLink } from "@/components/button-link";
import { HeroTrailer } from "@/components/hero-trailer";
import { JsonLd } from "@/components/json-ld";
import { LumaCheckoutLink } from "@/components/luma-checkout-link";
import { MotionEffects } from "@/components/motion-effects";
import { PhotoGallery } from "@/components/photo-gallery";
import { PlasticCard } from "@/components/plastic-card";
import {
  buildBaseJsonLd,
  externalLinks,
  socialImage,
} from "@/lib/seo";
import Image from "next/image";
import type { CSSProperties } from "react";

const LOGO_IMAGE = "/images/official-tfs-logo.png";
const HERO_TRAILER_VIDEO = "/videos/website-background.mov";
const FILMSHOW_POSTER_IMAGE = socialImage.path;
const HERO_TRAILER_FALLBACK = FILMSHOW_POSTER_IMAGE;
const HERO_BACKGROUND_IMAGE = "/images/hero/the-space-background-20260727.jpg";
const HERO_DESKTOP_BACKGROUND_IMAGE = "/images/hero/the-space-background-20260727.jpg";
const FOUNDER_IMAGE = "/images/founder-carl-marks.jpg";

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
    alt: "A full Brooklyn audience watching short films at Filmshow",
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
  ["Event", "Brooklyn, New York"],
];

const whySubmitBody = [
  "I started Filmshow after screening one of my own short films.",
  "I knew a 12-minute short was not enough meat for people to show up and treat it like a night out. So I thought, I'll turn it into a show.",
  "My background is in the circus, and much like making a film, circus has no rules.",
  "With that in mind, I filled the space with men wearing red jumpsuits, turned the giant soundstage we were in into a bunker, and made my film the last remaining archive of a time from long ago.",
  "There was slapstick, tears, the film, and giggles.",
  "Then came Filmshow.",
  "The same thing, but with different artists' films each show, different circus artists and actors working together to make something truly unique every single time while showcasing New York City's underground art scene.",
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
      <JsonLd data={buildBaseJsonLd()} />
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
              <h2 className="copy-wide text-sm text-stone-300">About</h2>
            </div>
            <div className="what-is-filmshow-copy" data-reveal="text">
              <p className="section-kicker text-stone-100">
                At its core, Filmshow is an exhibition.
              </p>
              <div className="what-is-filmshow-body">
                <p className="body-large text-stone-300">
                  A place to see what&apos;s happening offline, in the world,
                  and on the streets.
                </p>
                <p className="body-large text-stone-300">
                  Films and theater were never meant to live online. But maybe
                  they can live together in a warehouse in Brooklyn on October
                  8th.
                </p>
                <p className="body-large text-stone-300">
                  We create the space for it.
                </p>
              </div>
              <LumaCheckoutLink variant="secondary">
                Get Tickets
              </LumaCheckoutLink>
            </div>
          </div>
        </div>
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
            <div className="max-w-2xl" data-reveal="text">
              <p className="body-large text-stone-300">
                A Brooklyn space built for short films, performances, and a crowd.
              </p>
            </div>
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
                Submit a short film for a live Brooklyn audience. Selected films
                screen with performance moments, audience voting, and a cash prize.
              </p>
              <p className="copy-wide mt-6 text-xs text-red-300">
                Vol. 1 | 10.8.26 | NYC
              </p>
              <div className="mt-10">
                <ButtonLink href={externalLinks.submit} newTab>
                  Submit Film
                </ButtonLink>
              </div>
              <div className="mt-5">
                <ButtonLink href="/how-it-works" variant="quiet">
                  See how Filmshow works
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

      <Divider />

      <section className="section-pad originals-teaser-section">
        <div className="container-page">
          <div className="originals-teaser" data-reveal="text">
            <p className="copy-wide small-label text-red-300">
              Filmshow Originals
            </p>
            <h2 className="section-kicker mt-5 text-stone-100">
              We fund films before they exist.
            </h2>
            <p className="body-large mt-6 max-w-2xl text-stone-300">
              Pitch us a short film. One filmmaker will receive $2,000, support
              from Bluebird, and a premiere at Filmshow.
            </p>
            <div className="mt-10">
              <ButtonLink href="/originals" variant="secondary">
                Learn About Originals
              </ButtonLink>
            </div>
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
                href={externalLinks.founderInstagram}
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
