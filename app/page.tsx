import { ButtonLink } from "@/components/button-link";
import { ClippedLoopVideo } from "@/components/clipped-loop-video";
import { HeroTrailer } from "@/components/hero-trailer";
import { JsonLd } from "@/components/json-ld";
import { LumaCheckoutLink } from "@/components/luma-checkout-link";
import { MotionEffects } from "@/components/motion-effects";
import { PhotoGallery } from "@/components/photo-gallery";
import { PlasticCard } from "@/components/plastic-card";
import Image from "next/image";
import {
  buildBaseJsonLd,
  externalLinks,
  socialImage,
} from "@/lib/seo";
import type { CSSProperties } from "react";

const LOGO_IMAGE = "/images/official-tfs-logo.png";
const HERO_TRAILER_VIDEO = "/videos/website-background.mov";
const FILMSHOW_POSTER_IMAGE = socialImage.path;
const HERO_TRAILER_FALLBACK = FILMSHOW_POSTER_IMAGE;
const HERO_BACKGROUND_IMAGE = "/images/originals/tootsie-background.jpg";
const HERO_DESKTOP_BACKGROUND_IMAGE = "/images/originals/tootsie-background.jpg";
const NEWS_URL =
  "https://usanews.com/newsroom/filmshow-turns-short-films-into-a-night-out";
const SHOW_FILMSHOW_GRANT = false;

const galleryPhotos = [
  {
    src: "/images/optimized/gallery-space.jpg",
    alt: "Filmshow event space before the screening",
    position: "center",
    caption: "Before lights.",
    portrait: true,
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
    src: "/images/the-team.jpg",
    alt: "Filmshow team gathered near a Toy Gun poster",
    position: "center 58%",
    portrait: true,
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
  "Filmshow began after Keenan Gray screened one of his own short films.",
  "He realized that a 12-minute film alone wasn't enough to make audiences treat the evening as a true night out. So instead of simply hosting a screening, he built an entire show around it.",
  "Drawing on his background as a circus performer, Keenan approached the experience with the same philosophy that guides both circus and filmmaking: there are no rules.",
  "He filled the venue with performers in red jumpsuits, transformed the soundstage into a bunker, and framed his film as the last surviving archive from a time long ago.",
  "The evening blended slapstick comedy, live performance, laughter, and cinema into a single immersive experience.",
  "That night became the foundation for Filmshow.",
  "Today, each edition brings together a new collection of films, actors, and performers to create a one-of-a-kind live experience while celebrating New York City's underground artistic community.",
];

const teamMembers = [
  {
    name: "Keenan Gray",
    role: "Founder & Director",
    image: "/images/team/keenan-gray.jpg",
    imagePosition: "58% 38%",
  },
  {
    name: "Sam Ferlo",
    role: "Theater Producer",
    image: "/images/team/sam-ferlo.jpg",
    imagePosition: "58% 42%",
  },
] as const;

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
            <ClippedLoopVideo
              src="/videos/about-filmshow-background.mov"
              className="what-is-filmshow-video"
              startTime={6}
              endTime={20}
            />
            <div
              className="what-is-filmshow-label section-label"
              data-reveal="section-label"
            >
              <p className="copy-wide small-label text-red-500">01</p>
              <h2 className="copy-wide text-sm text-stone-300">Experience</h2>
            </div>
            <div className="what-is-filmshow-copy" data-reveal="text">
              <p className="section-kicker text-stone-100">
                It&apos;s an exhibition.
              </p>
              <div className="what-is-filmshow-body">
                <p className="body-large text-stone-300">
                  A place to see what&apos;s happening offline, in the world,
                  and on the streets.
                </p>
                <p className="body-large text-stone-300">
                  Films and theater were never meant to live online. But maybe
                  they can live together in a warehouse in Brooklyn on October
                  3rd.
                </p>
              </div>
              <div className="what-is-filmshow-actions">
                <LumaCheckoutLink variant="secondary">
                  Get Tickets
                </LumaCheckoutLink>
                <ButtonLink href={NEWS_URL} variant="secondary" newTab>
                  News
                </ButtonLink>
              </div>
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
                We set Filmshow in the same space where Beyoncé filmed the
                Single Ladies music video. Nice.
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
                On October 3rd, 2026, selected short films will screen in front
                of a live audience at Rollin Studios in Brooklyn, on a giant 45
                foot cyc wall.
              </p>
              <p className="copy-wide mt-6 text-xs text-red-300">
                Vol. 1 | 10.3.26 | NYC
              </p>
              <div className="mt-10">
                <ButtonLink href={externalLinks.submit} newTab>
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

      <Divider />

      {SHOW_FILMSHOW_GRANT ? (
        <>
          <section className="section-pad originals-teaser-section">
            <div className="container-page">
              <div className="originals-teaser" data-reveal="text">
                <p className="copy-wide small-label text-red-300">
                  Filmshow Grant
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
                    Learn About Grant
                  </ButtonLink>
                </div>
              </div>
            </div>
          </section>

          <div className="submit-why-fade" aria-hidden="true" />
        </>
      ) : null}

      <section id="why-submit" className="section-pad why-submit-section">
        <div className="container-page">
          <SectionLabel number="03" title="Why Filmshow" />
          <div className="why-submit-grid">
            <h2 className="section-kicker why-submit-title text-center text-stone-100" data-reveal="text">
              Why now
            </h2>
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

      <section id="team" className="section-pad home-team-section">
        <div className="container-page">
          <SectionLabel number="04" title="Team" />
          <div className="home-team-heading" data-reveal="text">
            <h2 className="section-kicker text-stone-100">
              The team.
            </h2>
            <ButtonLink href="/team" variant="secondary">
              Meet the Team
            </ButtonLink>
          </div>
          <div className="home-team-grid">
            {teamMembers.map((member, index) => (
              <PlasticCard
                key={member.name}
                className="team-card home-team-card"
                style={{ "--reveal-delay": `${index * 70}ms` } as CSSProperties}
                reveal
              >
                <div className="team-card-image-wrap" data-reveal="photo">
                  <Image
                    src={member.image}
                    alt={`${member.name} headshot`}
                    fill
                    sizes="(min-width: 1024px) 15vw, (min-width: 768px) 24vw, 50vw"
                    className="team-card-image"
                    style={{ objectPosition: member.imagePosition }}
                  />
                </div>
                <div className="team-card-copy">
                  <h3 className="team-card-name text-stone-100">
                    {member.name}
                  </h3>
                  <p className="copy-wide small-label mt-3 text-red-300">
                    {member.role}
                  </p>
                </div>
              </PlasticCard>
            ))}
          </div>
        </div>
      </section>

      <Divider />
    </main>
  );
}
