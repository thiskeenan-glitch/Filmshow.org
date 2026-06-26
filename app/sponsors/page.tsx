import { SponsorInquiryForm } from "@/components/sponsor-inquiry-form";
import { PlasticCard } from "@/components/plastic-card";

export const metadata = {
  title: "Sponsors | Film Show",
};

const tiers = [
  ["Friend of the Show", "$500"],
  ["Supporting Sponsor", "$1,000"],
  ["Cash Sponsor", "$2,500+"],
  ["Presenting Sponsor", "Custom"],
];

const benefits = [
  "Logo on site",
  "Logo in event materials",
  "Social mention",
  "On screen thank you",
  "Optional table or product placement",
];

export default function SponsorsPage() {
  return (
    <main className="hero-pad">
      <section className="container-page relative">
        <p className="copy-wide small-label mb-8 text-red-300">
          Film Show · Sponsors
        </p>
        <h1 className="section-kicker max-w-5xl text-stone-100">
          Sponsor Film Show.
        </h1>
        <p className="body-large mt-10 max-w-3xl text-stone-300">
          Support a visually exciting NYC film event built for filmmakers,
          audiences, and the creative community.
        </p>
      </section>

      <div className="container-page my-16 sm:my-20"><div className="h-px bg-stone-100/10" /></div>

      <section className="container-page relative grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiers.map(([tier, price]) => (
          <PlasticCard
            key={tier}
            className="plastic-pad lg:min-h-64"
          >
            <p className="min-h-12 font-sans text-[clamp(1.25rem,2vw,1.65rem)] font-semibold leading-[1.18] tracking-[-0.012em] text-stone-100">
              {tier}
            </p>
            <p className="mt-8 font-sans text-[clamp(2rem,3.2vw,2.85rem)] font-bold leading-[1.02] tracking-[-0.035em] text-red-200">
              {price}
            </p>
          </PlasticCard>
        ))}
      </section>

      <section className="container-page relative mt-16 grid gap-12 sm:mt-20 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <h2 className="section-kicker text-stone-100">
            Benefits
          </h2>
          <ul className="mt-10 divide-y divide-stone-100/10 border-y border-stone-100/10">
            {benefits.map((benefit) => (
              <li key={benefit} className="body-copy py-5 text-stone-300">
                {benefit}
              </li>
            ))}
          </ul>
        </div>
        <SponsorInquiryForm />
      </section>
    </main>
  );
}
