import { ButtonLink } from "@/components/button-link";
import { MotionEffects } from "@/components/motion-effects";
import { PhotoGallery } from "@/components/photo-gallery";
import { PlasticCard } from "@/components/plastic-card";
import { ScrollFadeVideo } from "@/components/scroll-fade-video";
import Image from "next/image";
import type { CSSProperties } from "react";

const LUMA_EVENT_URL = "https://luma.com/wqhep4p3";
const FILMFREEWAY_URL = "https://filmfreeway.com/TheFilmShow";
const SITE_URL = "https://www.filmshow.org";
const LOGO_IMAGE = "/images/official-tfs-logo.png";
const TICKETS_VIDEO = "/videos/tickets-loop.mp4";
const CONTACT_EMAIL = "info@filmshow.org";
const SOCIAL_URLS: string[] = [];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Film Show",
      alternateName: "The Film Show",
      url: SITE_URL,
      logo: `${SITE_URL}${LOGO_IMAGE}`,
      description:
        "A live short-film event in New York City featuring curated short films, live performances, and a $6,000 cash prize.",
      ...(SOCIAL_URLS.length ? { sameAs: SOCIAL_URLS } : {}),
    },
    {
      "@type": "Event",
      name: "Film Show Vol. 1",
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
        name: "Film Show",
        url: SITE_URL,
      },
      url: SITE_URL,
      image: [`${SITE_URL}/images/optimized/tfs-poster-social.jpg`],
      description:
        "A live show in New York City featuring curated short films, live performances, and a $6,000 cash prize.",
    },
  ],
};

const galleryPhotos = [
  {
    src: "/images/optimized/gallery-space.jpg",
    alt: "Film Show event space before the screening",
    position: "center",
    portrait: true,
  },
  {
    src: "/images/the-team.jpg",
    alt: "Film Show team gathered near a Toy Gun poster",
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

const works = [
  [
    "01",
    "Selection",
    "6 to 8, depending on length of live show, are chosen for the night based on direction, originality, tone, style, point of view, and fit for the live room.",
  ],
  [
    "02",
    "Screening",
    "Selected films screen live in New York City for Vol. 1 | 10.8.26 | NYC as part of a curated event with short live performance moments between films.",
  ],
  [
    "03",
    "The jury",
    "A jury of established filmmakers and artists selects 1st Place.",
  ],
  [
    "04",
    "The room votes",
    "At the end of the night, the audience votes live for 2nd Place and 3rd Place.",
  ],
  [
    "05",
    "The winners",
    "The top three films are announced in the room. Cash prizes are awarded to the winning filmmakers the night of the event.",
  ],
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

const whySubmitReasons = [
  [
    "Not a traditional festival.",
    "Film Show is built as a live screening event, not a long list of blocks and badges.",
  ],
  [
    "Only 6 to 8 films.",
    "The lineup stays tight so each selected film has weight in the room.",
  ],
  [
    "Real attention.",
    "Every selected film is watched with an audience that is there for the work.",
  ],
  [
    "Film, performance, audience, prize money.",
    "The night brings together live performance, audience energy, and a meaningful cash prize.",
  ],
];

const faqs = [
  [
    "01",
    "What kind of films can I submit?",
    "Films must be 15 minutes or under, including credits. All genres are welcome.",
  ],
  [
    "02",
    "Do I need to live in New York?",
    "No. Filmmakers anywhere can submit. Selected filmmakers are encouraged to attend, but it is not required.",
  ],
  [
    "03",
    "How is 1st Place chosen?",
    "1st Place is selected by a jury of established filmmakers and artists.",
  ],
  [
    "04",
    "How are 2nd and 3rd Place chosen?",
    "2nd Place and 3rd Place are determined by live audience vote at the event.",
  ],
  [
    "05",
    "When is the cash prize awarded?",
    "Cash prizes are awarded to the winning filmmakers the night of the event.",
  ],
  [
    "06",
    "Does Film Show own my film?",
    "No. Filmmakers keep ownership. Film Show only receives permission to screen selected films and use excerpts, stills, trailers, posters, filmmaker names, and film titles for promotion related to the event.",
  ],
  [
    "07",
    "Are submission fees refundable?",
    "Submission fees are nonrefundable unless the event is canceled.",
  ],
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
      <section id="top" className="og-hero relative isolate overflow-hidden">
        <Image
          src="/assets/optimized/hero-background.jpg"
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className="hero-bg-image hero-bg-image--desktop"
          aria-hidden="true"
        />
        <Image
          src="/images/audience-wrapped-in-plastic.jpg"
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className="hero-bg-image hero-bg-image--mobile"
          aria-hidden="true"
        />
        <div className="hero-bg-overlay" aria-hidden="true" />
        <div className="container-page relative z-10">
          <div className="hero-lockup mx-auto flex w-full flex-col">
            <div className="hero-brand-row">
              <p className="hero-eyebrow copy-wide small-label text-red-500">
                VOL. 1 | 10.8.26 | NYC
              </p>

              <div className="hero-logo-wrap">
                <Image
                  src={LOGO_IMAGE}
                  alt="Film Show"
                  width={3400}
                  height={1362}
                  priority
                  unoptimized
                  className="hero-logo-main"
                />
              </div>
            </div>

            <div className="hero-text-block mx-auto flex max-w-3xl flex-col items-center text-center">
              <p className="hero-copy body-large mt-12 text-stone-300">
                <span className="hero-copy-desktop">
                  A live NYC short film event featuring curated shorts, live performances,
                  a $6,000 cash prize, jury-selected 1st Place, and live audience
                  voting for 2nd and 3rd.
                </span>
                <span className="hero-copy-mobile">
                  A live show in New York City featuring curated short films, live performances and a $6,000 cash prize.
                </span>
              </p>

              <p className="hero-manifesto copy-wide mt-8 w-fit border-y border-red-500/35 py-3 text-[0.75rem] text-red-300">
                GOOD ART SHOULD MAKE MONEY.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="submit" className="section-pad">
        <div className="container-page">
          <SectionLabel number="01" title="Filmmakers" />
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
        </div>
      </section>

      <Divider />

      <section id="why-submit" className="section-pad">
        <div className="container-page">
          <SectionLabel number="02" title="Why submit" />
          <div className="why-submit-grid">
            <div data-reveal="text">
              <p className="section-kicker max-w-xl text-stone-100">
                Why submit to Film Show?
              </p>
              <p className="body-large mt-8 max-w-xl text-stone-300">
                Not every room feels the same. This one is designed to make a selected film land.
              </p>
              <div className="mt-10">
                <ButtonLink href={FILMFREEWAY_URL} variant="secondary" newTab>
                  Submit Your Film
                </ButtonLink>
              </div>
            </div>
            <div className="why-submit-list">
              {whySubmitReasons.map(([title, copy], index) => (
                <article
                  key={title}
                  data-reveal="row"
                  className="why-submit-item"
                  style={{ "--reveal-delay": `${index * 60}ms` } as CSSProperties}
                >
                  <h3 className="why-submit-title text-stone-100">{title}</h3>
                  <p className="body-copy mt-3 max-w-2xl text-stone-400">{copy}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Divider />

      <section id="prize" className="section-pad cash-section">
        <div className="container-page relative z-10">
          <SectionLabel number="03" title="The prize" />
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

      <Divider />

      <section id="how-it-works" className="section-pad">
        <div className="container-page">
          <SectionLabel number="04" title="How it works" />
          <div className="divide-y divide-stone-100/10 border-y border-stone-100/10">
            {works.map(([number, title, copy]) => (
              <article
                key={title}
                data-reveal="row"
                className="grid gap-4 py-8 md:grid-cols-[4rem_14rem_1fr] md:items-start md:gap-6 md:py-10"
              >
                <p className="copy-wide small-label text-red-500">{number}</p>
                <h3 className="font-sans text-[clamp(1.2rem,1.7vw,1.55rem)] font-semibold leading-[1.2] tracking-[-0.01em] text-stone-100">
                  {title}
                </h3>
                <p className="body-copy max-w-3xl text-stone-300">{copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Divider />

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

      <section className="section-pad" id="tickets">
        <div className="container-page">
          <SectionLabel number="05" title="TICKETS" />
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div data-reveal="text">
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
            <div className="tickets-video-wrapper lg:self-center" data-reveal="photo">
              <ScrollFadeVideo
                src={TICKETS_VIDEO}
                label="Film Show event video"
                className="tickets-video"
              />
            </div>
          </div>
        </div>
      </section>

      <Divider />

      <section id="faq" className="section-pad">
        <div className="container-page">
          <SectionLabel number="06" title="Questions" />
          <div className="grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
            <p className="section-kicker text-stone-100" data-reveal="text">
              FAQ
            </p>
            <div className="divide-y divide-stone-100/10 border-y border-stone-100/10">
              {faqs.map(([number, question, answer], index) => (
                <details
                  key={question}
                  className="faq-row group"
                  data-reveal="row"
                  style={{ "--reveal-delay": `${index * 55}ms` } as CSSProperties}
                >
                  <summary className="flex cursor-pointer list-none gap-5 py-7 text-left text-base text-stone-100 transition sm:gap-7 sm:py-8">
                    <span className="copy-wide small-label min-w-8 pt-1.5 text-red-400">
                      {number}
                    </span>
                    <span className="faq-question flex-1">
                      {question}
                    </span>
                    <span className="pt-1 text-red-400 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="body-copy pb-8 pl-10 text-stone-300 sm:pl-14">
                    {answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Divider />

      <section id="contact" className="section-pad border-t border-stone-100/10">
        <div className="container-page">
          <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
            <p className="copy-wide small-label text-red-300">CONTACT</p>
            <h2 className="section-kicker mt-5 text-stone-100">Get in touch.</h2>
            <p className="body-large mt-8 max-w-2xl text-stone-300">
              For submissions, sponsorships, venue questions, press, or anything else.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="copy-wide mt-8 inline-block text-sm font-bold text-red-300 transition hover:text-stone-100"
            >
              {CONTACT_EMAIL}
            </a>
            <div className="footer-cta-buttons mt-12 flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
              <ButtonLink href={LUMA_EVENT_URL} newTab>
                Get Tickets
              </ButtonLink>
              <ButtonLink href={FILMFREEWAY_URL} variant="secondary" newTab>
                Submit Your Film
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
