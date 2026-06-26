import { ButtonLink } from "@/components/button-link";
import { MotionEffects } from "@/components/motion-effects";
import { PhotoGallery } from "@/components/photo-gallery";
import { PlasticCard } from "@/components/plastic-card";
import { ScrollFadeVideo } from "@/components/scroll-fade-video";
import Image from "next/image";
import type { CSSProperties } from "react";

const LUMA_EVENT_URL = "https://luma.com/wqhep4p3";
const LOGO_IMAGE = "/images/official-tfs-logo.png";
const TICKETS_VIDEO = "/videos/tickets-loop.mp4";
const SUBMIT_VIDEO = "/videos/submit-loop.mp4";

const galleryPhotos = [
  {
    src: "/images/tfs-poster.png",
    alt: "Film Show Volume 1 poster",
    position: "center",
    square: true,
  },
  {
    src: "/images/the-space.heic",
    alt: "Film Show event space before the screening",
    position: "center",
  },
  {
    src: "/images/the-team.jpg",
    alt: "Film Show team seated in front of a film poster",
    position: "center",
    portrait: true,
  },
  {
    src: "/images/hq-ladder-pic.png",
    alt: "Performer balancing on a ladder in red costume",
    position: "center top",
    portrait: true,
  },
  {
    src: "/images/the-crowd.jpg",
    alt: "Audience watching a film projected in a dark room",
    position: "center",
    portrait: true,
  },
  {
    src: "/images/hq-3-people.png",
    alt: "Three performers during a live performance beside a ladder",
    position: "center",
    square: true,
  },
  {
    src: "/images/lots-of-people.jpg",
    alt: "A full audience seated for a screening",
    position: "center",
  },
  {
    src: "/images/hq-high-five.png",
    alt: "Performers high five beside a ladder during a live performance",
    position: "center top",
    portrait: true,
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
    "Selected films screen live in New York City for Vol. 1 | 6.8.26 | NYC as part of a curated event with short live performance moments between films.",
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
    "The top three films are announced in the room. The cash is paid to each winning filmmaker the night of the event.",
  ],
];

const cashAwards = [
  ["1st Place", "$3,000", "Selected by a jury of established filmmakers and artists. Winner gets $3,000 cash."],
  ["2nd Place", "$2,000", "Determined by live audience vote. Winner gets $2,000 cash."],
  ["3rd Place", "$1,000", "Determined by live audience vote. Winner gets $1,000 cash."],
];

const filmmakerDetails = [
  ["Runtime", "15 minutes or under"],
  ["Genres", "All genres welcome"],
  ["Location", "Filmmakers anywhere can submit"],
  ["Selected films", "6 to 8, depending on length of live show"],
  ["Cash", "$6,000"],
  ["Event", "New York City"],
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
    "When is the cash paid?",
    "Cash is paid to the winning filmmaker the night of the event.",
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
      <MotionEffects />
      <section id="top" className="og-hero relative isolate overflow-hidden">
        <div className="container-page relative z-10">
          <div className="hero-lockup mx-auto flex w-full flex-col">
            <div className="hero-brand-row">
              <p className="hero-eyebrow copy-wide small-label text-red-500">
                VOL. 1 | 6.8.26 | NYC
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
                A live NYC short film event featuring curated shorts, live performances,
                $6,000 cash, jury-selected 1st Place, and live audience
                voting for 2nd and 3rd.
              </p>

              <p className="hero-manifesto copy-wide mt-8 w-fit border-y border-red-500/35 py-3 text-[0.75rem] text-red-300">
                Good art should make money.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad" id="tickets">
        <div className="container-page">
          <SectionLabel number="01" title="Tickets" />
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div data-reveal="text">
              <p className="section-kicker text-stone-100">
                Be in the room.
              </p>
              <p className="body-copy mt-8 max-w-xl text-stone-300">
                Film Show will be a live NYC screening event for Vol. 1 |
                6.8.26 | NYC with curated short films, performance moments,
                a jury-selected 1st Place, live audience voting for 2nd and
                3rd, winners announced live, and cash paid the night of the event.
              </p>
              <p className="body-copy mt-5 max-w-xl text-stone-500">
                Ticket purchase, confirmations, guest list, and check in are
                handled by our partner Luma.
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={LUMA_EVENT_URL} newTab>
                  Get Tickets
                </ButtonLink>
                <ButtonLink href="/tickets" variant="secondary">
                  Ticket info
                </ButtonLink>
              </div>
            </div>
            <div className="submit-image-frame lg:self-center" data-reveal="photo">
              <ScrollFadeVideo
                src={TICKETS_VIDEO}
                label="Film Show event video"
                className="submit-image"
              />
            </div>
          </div>
        </div>
      </section>

      <Divider />

      <section id="submit" className="section-pad">
        <div className="container-page">
          <SectionLabel number="02" title="Filmmakers" />
          <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <div data-reveal="text">
              <p className="section-kicker text-stone-100">
                Submit your film.
              </p>
              <p className="body-copy mt-8 max-w-xl text-stone-300">
                Seen in a room. On a big screen.
              </p>
              <p className="copy-wide mt-6 text-xs text-red-300">
                Vol. 1 | 6.8.26 | NYC
              </p>
              <div className="mt-10">
                <ButtonLink href="https://filmfreeway.com/TheFilmShow" newTab>
                  Submit Film
                </ButtonLink>
              </div>
            </div>
            <div className="submit-side-panel">
              <div className="submit-image-frame" data-reveal="photo">
                <ScrollFadeVideo
                  src={SUBMIT_VIDEO}
                  label="Film Show submit section video"
                  className="submit-image submit-video"
                />
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

      <section id="photos" className="photo-gallery-section section-pad">
        <div className="container-page">
          <div className="grid gap-5 md:grid-cols-[0.72fr_1.28fr] md:items-end">
            <div data-reveal="text">
              <p className="copy-wide small-label text-red-300">Photos</p>
              <h2 className="section-kicker mt-5 text-stone-100">
                Seen in a room.
              </h2>
            </div>
          <p className="body-large max-w-2xl text-stone-300" data-reveal="text">
            short films | live performances
          </p>
          </div>
        </div>
        <PhotoGallery photos={galleryPhotos} />
      </section>

      <Divider />

      <section id="about" className="section-pad">
        <div className="container-page">
          <SectionLabel number="03" title="How it works" />
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

      <section id="cash" className="section-pad cash-section">
        <div className="container-page relative z-10">
          <SectionLabel number="04" title="The money" />
          <div className="cash-content">
            <div className="max-w-sm" data-reveal="text">
              <p className="cash-total-number text-stone-100">
                $6,000
              </p>
              <p className="copy-wide mt-4 text-sm text-red-300">
                Cash
              </p>
              <p className="mt-8 max-w-md text-sm leading-6 text-stone-500">
                Cash paid to the winning filmmaker the night of the event.
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

      <section id="faq" className="section-pad">
        <div className="container-page">
          <SectionLabel number="05" title="Questions" />
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
    </main>
  );
}
