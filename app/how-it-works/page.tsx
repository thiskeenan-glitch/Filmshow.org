import { ButtonLink } from "@/components/button-link";
import { JsonLd } from "@/components/json-ld";
import {
  buildBreadcrumbJsonLd,
  createPageMetadata,
  externalLinks,
  routeMetadata,
} from "@/lib/seo";

export const metadata = createPageMetadata(routeMetadata.howItWorks);

const works = [
  [
    "01",
    "Selection",
    "Short films are chosen for the night based on direction, originality, tone, style, point of view, and fit for the live room.",
  ],
  [
    "02",
    "Screening",
    "Selected films screen live in Brooklyn for Vol. 1 | 10.8.26 | NYC as part of a curated event with short live performance moments between films.",
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
    "The top three films are announced in the room.",
  ],
];

export default function HowItWorksPage() {
  return (
    <main className="hero-pad how-it-works-section">
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Filmshow", path: "/" },
          { name: "What Is Filmshow?", path: "/how-it-works" },
        ])}
      />
      <section className="container-page">
        <div className="relative z-10">
          <p className="copy-wide small-label mb-8 text-red-300">
            Filmshow process
          </p>
          <h1 className="section-kicker max-w-4xl text-stone-100">
            How it works.
          </h1>
          <p className="body-large mt-10 max-w-2xl text-stone-300">
            Short films. One night in Brooklyn. A real audience, live
            performance moments, and a clear path from submission to screening.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/tickets" variant="secondary">
              Get Filmshow tickets
            </ButtonLink>
            <ButtonLink href={externalLinks.submit} variant="quiet" newTab>
              Submit your short film
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="container-page relative z-10 mt-20 pb-24">
        <div className="divide-y divide-stone-100/10 border-y border-stone-100/10">
          {works.map(([number, title, copy]) => (
            <article
              key={title}
              className="grid gap-4 py-8 md:grid-cols-[4rem_14rem_1fr] md:items-start md:gap-6 md:py-10"
            >
              <p className="copy-wide small-label text-red-500">{number}</p>
              <h2 className="font-sans text-[clamp(1.2rem,1.7vw,1.55rem)] font-semibold leading-[1.2] tracking-normal text-stone-100">
                {title}
              </h2>
              <p className="body-copy max-w-3xl text-stone-300">{copy}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
