import { ButtonLink } from "@/components/button-link";
import { PlasticCard } from "@/components/plastic-card";

const LUMA_EVENT_URL = "https://luma.com/wqhep4p3";

export const metadata = {
  title: "Tickets | Film Show",
};

const eventFacts = [
  ["Date and time", "Vol. 1 | 6.8.26 | NYC"],
  ["Venue", "New York City location TBA"],
  ["Cash", "$6,000"],
  ["Voting", "The audience votes live for 2nd and 3rd Place"],
];

const nightIncludes = [
  "6 to 8, depending on length of live show",
  "Live performance moments between films",
  "A jury-selected 1st Place",
  "Live audience voting for 2nd and 3rd Place",
  "Winners announced in the room. Cash paid the night of the event.",
  "Drinks, sponsors, and a real night out feeling",
];

export default function TicketsPage() {
  return (
    <main className="hero-pad">
      <section className="container-page">
        <div>
          <p className="copy-wide small-label mb-8 text-red-300">
            Vol. 1 | 6.8.26 | NYC
          </p>
          <h1 className="section-kicker max-w-4xl text-stone-100">
            Tickets
          </h1>
          <p className="body-large mt-10 max-w-2xl text-stone-300">
            Film Show is a live NYC screening event for Vol. 1 | 6.8.26 | NYC
            featuring curated short films, live performances, a jury-selected
            1st Place, live audience voting for 2nd and 3rd, and $6,000 cash.
          </p>
          <p className="body-copy mt-6 max-w-2xl text-stone-500">
            Film Show website is the home base. Ticket purchase,
            confirmations, guest list, and check in are handled by our partner
            Luma.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={LUMA_EVENT_URL} newTab>
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
          <p className="section-title text-stone-100">
            What the night includes
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {nightIncludes.map((item) => (
            <PlasticCard key={item} className="plastic-pad">
              <p className="body-copy text-stone-200">{item}</p>
            </PlasticCard>
          ))}
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
            <ButtonLink href={LUMA_EVENT_URL} newTab>
              Get tickets
            </ButtonLink>
          </div>
        </PlasticCard>
      </section>
    </main>
  );
}
