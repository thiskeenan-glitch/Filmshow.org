import { ButtonLink } from "@/components/button-link";
import { JsonLd } from "@/components/json-ld";
import { LumaCheckoutLink } from "@/components/luma-checkout-link";
import { PlasticCard } from "@/components/plastic-card";
import {
  buildBreadcrumbJsonLd,
  createPageMetadata,
  externalLinks,
  routeMetadata,
} from "@/lib/seo";

export const metadata = createPageMetadata(routeMetadata.about);

const details = [
  ["Date", "Vol. 1 | 10.8.26 | Brooklyn, NYC"],
  ["Location", "Brooklyn, New York"],
  ["Films", "Short films curated for the live show"],
];

export default function AboutPage() {
  return (
    <main className="hero-pad">
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Filmshow", path: "/" },
          { name: "Why Filmshow Exists", path: "/about" },
        ])}
      />
      <section className="container-page">
        <div>
          <p className="copy-wide small-label mb-8 text-red-300">
            Vol. 1 | 10.8.26 | Brooklyn, NYC
          </p>
          <h1 className="section-kicker max-w-4xl text-stone-100">
            About Filmshow.
          </h1>
          <p className="body-large mt-10 max-w-2xl text-stone-300">
            A live Brooklyn short-film event featuring curated shorts, live
            performances, audience participation, and filmmakers gathered around
            a real room.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={externalLinks.submit} newTab>
              Submit Film
            </ButtonLink>
            <LumaCheckoutLink variant="secondary">
              Get tickets
            </LumaCheckoutLink>
            <ButtonLink href="/how-it-works" variant="quiet">
              Explore the Filmshow experience
            </ButtonLink>
          </div>
        </div>
      </section>

      <section className="container-page mt-18">
        <div className="max-w-3xl border-y border-stone-100/10 py-8 md:py-10">
          <p className="copy-wide small-label text-red-300">Mission</p>
          <p className="body-large mt-6 text-stone-300">
            Filmshow was created to give independent filmmakers a real room and a
            real audience. It is built
            for films that deserve concentration, atmosphere, and a crowd that is
            actually there for the work. The goal is simple: make a screening here
            feel like it matters.
          </p>
        </div>
      </section>

      <section className="container-page mt-20 grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
        <div>
          <h2 className="section-title text-stone-100">
            Event details
          </h2>
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
