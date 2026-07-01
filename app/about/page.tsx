import { ButtonLink } from "@/components/button-link";
import { PlasticCard } from "@/components/plastic-card";

const LUMA_EVENT_URL = "https://luma.com/wqhep4p3";

export const metadata = {
  title: "About | Film Show",
};

const details = [
  ["Date", "Vol. 1 | 10.8.26 | NYC"],
  ["Location", "New York City"],
  ["Films", "6 to 8, depending on length of live show"],
  ["Prize", "$6,000 cash prize"],
  ["1st Place", "$3,000 cash prize, selected by The Film Show jury"],
  ["2nd Place", "$2,000 cash prize, audience vote"],
  ["3rd Place", "$1,000 cash prize, audience vote"],
];

export default function AboutPage() {
  return (
    <main className="hero-pad">
      <section className="container-page">
        <div>
          <p className="copy-wide small-label mb-8 text-red-300">
            Vol. 1 | 10.8.26 | NYC
          </p>
          <h1 className="section-kicker max-w-4xl text-stone-100">
            About Film Show.
          </h1>
          <p className="body-large mt-10 max-w-2xl text-stone-300">
            A live NYC short film event for Vol. 1 | 10.8.26 | NYC featuring
            curated shorts, live performances, jury-selected 1st Place, and
            live audience voting for 2nd and 3rd.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="https://filmfreeway.com/TheFilmShow" newTab>
              Submit Film
            </ButtonLink>
            <ButtonLink href={LUMA_EVENT_URL} variant="secondary" newTab>
              Get tickets
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="container-page mt-18">
        <div className="max-w-3xl border-y border-stone-100/10 py-8 md:py-10">
          <p className="copy-wide small-label text-red-300">Mission</p>
          <p className="body-large mt-6 text-stone-300">
            Film Show was created to give independent filmmakers a real room, a real
            audience, and a real chance to earn meaningful prize money. It is built
            for films that deserve concentration, atmosphere, and a crowd that is
            actually there for the work. The goal is simple: make a screening here
            feel like it matters.
          </p>
        </div>
      </section>

      <section className="container-page mt-20 grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
        <div>
          <p className="section-title text-stone-100">
            Event details
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {details.map(([label, value]) => (
            <PlasticCard key={label} className="plastic-pad">
              <p className="copy-wide small-label text-red-300">{label}</p>
              <p className="body-copy mt-5 text-stone-100">{value}</p>
            </PlasticCard>
          ))}
        </div>
      </section>

      <div className="container-page mt-20 pb-24">
        <div className="poster-divider" />
      </div>
    </main>
  );
}
