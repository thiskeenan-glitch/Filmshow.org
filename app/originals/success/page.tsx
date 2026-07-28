import { ButtonLink } from "@/components/button-link";
import { ORIGINALS_SUBMISSION_COOKIE } from "@/lib/originals";
import { getOriginalsServerConfig } from "@/lib/originals-config";
import { createPageMetadata, externalLinks } from "@/lib/seo";
import { getOriginalsSubmission } from "@/lib/supabase-originals";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { OriginalsSuccessAnalytics } from "./success-analytics";

const successPageMetadata = createPageMetadata({
  path: "/originals/success",
  title: "Filmshow Originals Submission Received",
  description:
    "Confirmation page for a Filmshow Originals pitch submission.",
  priority: 0,
  lastModified: "2026-07-28",
});

export const metadata: Metadata = {
  ...successPageMetadata,
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export const dynamic = "force-dynamic";

async function isPaymentVerified() {
  try {
    const cookieStore = await cookies();
    const submissionId = cookieStore.get(ORIGINALS_SUBMISSION_COOKIE)?.value;
    if (!submissionId) return false;

    const config = getOriginalsServerConfig();
    const submission = await getOriginalsSubmission(config, submissionId);

    return submission?.status === "paid";
  } catch {
    return false;
  }
}

export default async function OriginalsSuccessPage() {
  const paymentVerified = await isPaymentVerified();

  return (
    <main className="hero-pad originals-success-page">
      {paymentVerified ? <OriginalsSuccessAnalytics /> : null}
      <section className="container-page">
        <div className="originals-success-panel">
          <p className="copy-wide small-label text-red-300">
            Filmshow Originals
          </p>
          <h1 className="section-kicker mt-5 text-stone-100">
            {paymentVerified
              ? "Your pitch is in."
              : "We are confirming your payment."}
          </h1>
          <p className="body-large mt-8 max-w-2xl text-stone-300">
            {paymentVerified
              ? "We received your Filmshow Originals application and payment. A confirmation has been sent to your email."
              : "This can take a moment. A confirmation email will be sent once Stripe verifies the payment."}
          </p>
          {paymentVerified ? (
            <p className="body-large mt-6 text-stone-100">
              Keep making strange things.
            </p>
          ) : null}
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
