import { JsonLd } from "@/components/json-ld";
import { MotionEffects } from "@/components/motion-effects";
import { PlasticCard } from "@/components/plastic-card";
import { areOriginalsSubmissionsReady } from "@/lib/originals-config";
import {
  buildBreadcrumbJsonLd,
  createPageMetadata,
  routeMetadata,
} from "@/lib/seo";
import { OriginalsApplicationForm } from "./originals-application-form";

export const metadata = createPageMetadata(routeMetadata.originals);
export const dynamic = "force-dynamic";

const processSteps = [
  {
    number: "01",
    title: "Pitch it",
    copy: "Tell us what the film is and how you would make it.",
  },
  {
    number: "02",
    title: "Pay the submission fee",
    copy: "Complete the $10 submission payment securely through Stripe.",
  },
  {
    number: "03",
    title: "We choose one",
    copy: "Filmshow selects one idea and filmmaker we believe in.",
  },
  {
    number: "04",
    title: "Make the film",
    copy: "The selected filmmaker receives $2,000 in production funding and support from Bluebird.",
  },
  {
    number: "05",
    title: "Premiere at Filmshow",
    copy: "The finished film premieres at an upcoming Filmshow in New York City.",
  },
];

const criteria = [
  "Original short-film ideas across any genre",
  "Films designed to be made for approximately $2,000",
  "A final runtime under five minutes",
  "Projects that can be completed within 30 days",
  "Filmmakers with previous work that demonstrates a clear voice",
  "Work that will feel exciting in a full room, not only online",
];

const filmmakerReceives = [
  "Production support from Bluebird",
  "A guaranteed premiere at an upcoming Filmshow",
  "Promotion through Filmshow and Bluebird",
  "A real deadline and a real audience",
];

const faqs = [
  {
    question: "Do I submit a finished film?",
    answer:
      "No. Filmshow Originals is for a film that has not yet been made. Submit a short pitch, not a completed film or full screenplay.",
  },
  {
    question: "What should be in the pitch?",
    answer:
      "A premise, a short explanation of how you would make the film for $2,000, a link to previous work, and your contact information. One to three pages is ideal if you upload a PDF.",
  },
  {
    question: "Does the film have to be written already?",
    answer:
      "No. The idea should be clear enough for us to understand the proposed film and how you would execute it, but a completed screenplay is not required.",
  },
  {
    question: "How long can the finished film be?",
    answer: "The finished film must run under five minutes.",
  },
  {
    question: "How quickly must it be completed?",
    answer:
      "The selected filmmaker must complete the film within 30 days of receiving funding and finalizing the production agreement.",
  },
  {
    question: "Can I apply from outside New York?",
    answer:
      "Yes, but the applicant is responsible for proposing a realistic production plan. The finished film will premiere at an upcoming Filmshow in New York City.",
  },
  {
    question: "Is the $2,000 grant the same as Filmshow's audience prize?",
    answer:
      "No. The Filmshow Originals production grant is separate from any live-show audience prize awarded to completed films.",
  },
];

type OriginalsPageProps = {
  searchParams?: Promise<{
    payment?: string;
    submission?: string;
  }>;
};

export default async function OriginalsPage({
  searchParams,
}: OriginalsPageProps) {
  const submissionsOpen = areOriginalsSubmissionsReady();
  const params = await searchParams;
  const cancelledSubmissionId =
    params?.payment === "cancelled" ? params.submission : "";

  return (
    <main className="originals-page hero-pad">
      <MotionEffects />
      <JsonLd
        data={buildBreadcrumbJsonLd([
          { name: "Filmshow", path: "/" },
          { name: "Filmshow Originals", path: "/originals" },
        ])}
      />

      <section className="originals-hero">
        <div className="container-page">
          <div className="originals-hero-copy" data-reveal="text">
            <p className="copy-wide small-label text-red-300">
              Filmshow Originals
            </p>
            <h1 className="originals-hero-title text-stone-100">
              Pitch us a film before it exists.
            </h1>
            <p className="body-large max-w-3xl text-stone-300">
              One filmmaker will receive $2,000 to create an original short
              film, production support from Bluebird, and a guaranteed premiere
              at an upcoming Filmshow in New York City.
            </p>
            <div className="originals-hero-actions">
              <a
                href="#application"
                className="button-shift relative inline-flex min-h-11 w-full items-center justify-center border border-stone-100/25 bg-stone-100 px-5 py-3 text-center text-[0.72rem] font-medium uppercase tracking-[0.1em] text-stone-950 hover:border-stone-100/60 hover:bg-transparent hover:text-stone-100 sm:w-auto sm:px-6"
              >
                Submit a Pitch
              </a>
              <a href="#how-it-works" className="originals-text-link">
                How it works
              </a>
            </div>
            <p className="copy-wide text-xs text-stone-500">
              One film. $2,000. Thirty days.
            </p>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page originals-intro-grid">
          <div>
            <p className="copy-wide small-label text-red-300">The idea</p>
          </div>
          <div data-reveal="text">
            <h2 className="section-kicker text-stone-100">
              We are not looking for a finished film. We are looking for an idea
              worth betting on.
            </h2>
            <div className="originals-prose mt-8 max-w-3xl">
              <p>
                Submit a concise pitch for an original short film that can be
                made for approximately $2,000, completed within 30 days, and run
                under five minutes.
              </p>
              <p>
                We care more about originality, clarity, and point of view than
                scale.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="section-pad originals-process">
        <div className="container-page">
          <div className="originals-section-heading" data-reveal="text">
            <p className="copy-wide small-label text-red-300">How it works</p>
            <h2 className="section-kicker mt-5 text-stone-100">
              A small pitch. A real deadline. A room waiting.
            </h2>
          </div>
          <div className="originals-process-grid originals-process-grid--five">
            {processSteps.map((step) => (
              <PlasticCard key={step.title} className="originals-step-card" reveal>
                <p className="copy-wide small-label text-red-300">
                  {step.number}
                </p>
                <h3 className="originals-step-title text-stone-100">
                  {step.title}
                </h3>
                <p className="body-copy mt-4 text-stone-300">{step.copy}</p>
              </PlasticCard>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page originals-list-grid">
          <div data-reveal="text">
            <p className="copy-wide small-label text-red-300">
              What we are looking for
            </p>
            <h2 className="section-kicker mt-5 text-stone-100">
              Small films with a real point of view.
            </h2>
          </div>
          <div className="originals-criteria-list" data-reveal="text">
            <ul>
              {criteria.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="body-large mt-8 text-stone-100">
              Comedy, drama, horror, documentary, animation, experimental work,
              music videos, and forms we have not thought of yet are all
              welcome.
            </p>
          </div>
        </div>
      </section>

      <section className="section-pad originals-funding-section">
        <div className="container-page">
          <div className="originals-funding-card" data-reveal="text">
            <div>
              <p className="copy-wide small-label text-red-300">
                What the selected filmmaker receives
              </p>
              <h2 className="originals-funding-title text-stone-100">
                $2,000
              </h2>
              <p className="copy-wide mt-5 text-sm text-stone-400">
                Production funding
              </p>
            </div>
            <ul className="originals-receives-list">
              {filmmakerReceives.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <OriginalsApplicationForm
        submissionsOpen={submissionsOpen}
        cancelledSubmissionId={cancelledSubmissionId}
      />

      <section className="section-pad originals-faq-section">
        <div className="container-page originals-list-grid">
          <div data-reveal="text">
            <p className="copy-wide small-label text-red-300">FAQ</p>
            <h2 className="section-kicker mt-5 text-stone-100">
              A few useful answers.
            </h2>
          </div>
          <div className="originals-faq-list" data-reveal="text">
            {faqs.map((item) => (
              <details key={item.question} className="originals-faq-item">
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad originals-final-cta">
        <div className="container-page">
          <div className="originals-final-cta-inner" data-reveal="text">
            <p className="copy-wide small-label text-red-300">
              Filmshow Originals
            </p>
            <h2 className="section-kicker mt-5 text-stone-100">
              Your next film can begin with a few paragraphs.
            </h2>
            <p className="body-large mt-6 max-w-2xl text-stone-300">
              Pitch us something bold, specific, and possible. We may give you
              $2,000 to make it real.
            </p>
            <div className="mt-10">
              <a
                href="#application"
                className="button-shift relative inline-flex min-h-11 w-full items-center justify-center border border-stone-100/25 bg-stone-100 px-5 py-3 text-center text-[0.72rem] font-medium uppercase tracking-[0.1em] text-stone-950 hover:border-stone-100/60 hover:bg-transparent hover:text-stone-100 sm:w-auto sm:px-6"
              >
                Submit a Pitch
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
