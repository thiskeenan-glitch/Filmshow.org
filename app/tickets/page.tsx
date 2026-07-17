import { ButtonLink } from "@/components/button-link";
import { JsonLd } from "@/components/json-ld";
import { PlasticCard } from "@/components/plastic-card";
import {
  buildBreadcrumbJsonLd,
  createPageMetadata,
  externalLinks,
  routeMetadata,
} from "@/lib/seo";

export const metadata = createPageMetadata(routeMetadata.tickets);

const eventFacts = [
  ["Date and time", "Vol. 1 | 10.8.26 | Brooklyn, NYC"],
  ["Venue", "Brooklyn location TBA"],
  ["Voting", "The audience votes live for 2nd and 3rd Place"],
];

const nightIncludes = [
  "Short films curated for the live show",
  "Live performance moments between films",
  "A jury-selected 1st Place",
  "Live audience voting for 2nd and 3rd Place",
  "Winners announced in the room.",
  "Drinks, sponsors, and a real night out feeling",
];

export default function TicketsPage() {
  return (
    <main className="hero-pad">
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Filmshow", path: "/" },
          { name: "Tickets", path: "/tickets" },
        ])}
      />
      <section className="container-page">
        <div>
          <p className="copy-wide small-label mb-8 text-red-300">
            Vol. 1 | 10.8.26 | Brooklyn, NYC
          </p>
          <h1 className="section-kicker max-w-4xl text-stone-100">
            Tickets
          </h1>
          <p className="body-large mt-10 max-w-2xl text-stone-300">
            Filmshow is a live short-film event in Brooklyn for Vol. 1 |
            10.8.26, featuring curated films, live performances, a cash prize,
            and audience participation.
          </p>
          <p className="body-copy mt-6 max-w-2xl text-stone-500">
            This website is the home base. Ticket purchase, confirmations,
            guest list, and check in are handled by our partner Luma.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={externalLinks.tickets} newTab>
              Get tickets
            </ButtonLink>
            <ButtonLink href="/" variant="secondary">
              Back to home
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="container-page mt-20 grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
        <div>
          <p className="copy-wide small-label text-red-300">
            Event details
          </p>
        </div>
        <div className="divide-y divide-stone-100/10 border-y border-stone-100/10">
          {eventFacts.map(([label, value]) => (
            <div key={label} className="grid gap-2 py-6 sm:grid-cols-[10rem_1fr]">
              <p className="copy-wide small-label text-stone-500">{label}</p>
              <p className="body-copy text-stone-100">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page mt-20 grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
        <div>
          <h2 className="section-title text-stone-100">
            What the night includes
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {nightIncludes.map((item) => {
            const isEmotionalLine = item.includes("real night out feeling");

            return (
            <PlasticCard key={item} className="plastic-pad">
              <p className={`body-copy ${
                isEmotionalLine
                  ? "text-stone-100"
                  : "text-stone-200"
              }`}>{item}</p>
            </PlasticCard>
            );
          })}
        </div>
      </section>

      <section className="container-page mt-20 pb-24">
        <PlasticCard className="plastic-pad">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <p className="copy-wide small-label text-red-300">Ticketing</p>
              <p className="body-copy mt-5 max-w-2xl text-stone-300">
                Ticket purchase, confirmations, guest list, and check in are
                handled by our partner Luma.
              </p>
            </div>
            <ButtonLink href={externalLinks.tickets} newTab>
              Get tickets
            </ButtonLink>
          </div>
        </PlasticCard>
      </section>
    </main>
  );
}
