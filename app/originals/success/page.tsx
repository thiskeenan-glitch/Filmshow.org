import { ButtonLink } from "@/components/button-link";
import { createPageMetadata, externalLinks } from "@/lib/seo";
import { OriginalsSuccessAnalytics } from "./success-analytics";

export const metadata = createPageMetadata({
  path: "/originals/success",
  title: "Filmshow Originals Submission Received",
  description:
    "Confirmation page for a Filmshow Originals pitch submission.",
  priority: 0,
});

export default function OriginalsSuccessPage() {
  return (
    <main className="hero-pad originals-success-page">
      <OriginalsSuccessAnalytics />
      <section className="container-page">
        <div className="originals-success-panel">
          <p className="copy-wide small-label text-red-300">
            Filmshow Originals
          </p>
          <h1 className="section-kicker mt-5 text-stone-100">
            Your pitch is in.
          </h1>
          <p className="body-large mt-8 max-w-2xl text-stone-300">
            We received your Filmshow Originals application and payment. A
            confirmation has been sent to your email.
          </p>
          <p className="body-large mt-6 text-stone-100">
            Keep making strange things.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <ButtonLink href="/">Return to Filmshow</ButtonLink>
            <ButtonLink
              href={externalLinks.founderInstagram}
              variant="secondary"
              newTab
            >
              Follow Filmshow on Instagram
            </ButtonLink>
          </div>
        </div>
      </section>
    </main>
  );
}
