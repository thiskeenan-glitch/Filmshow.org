import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TicketGiveawayForm } from "./ticket-giveaway-form";

export const metadata: Metadata = {
  title: "Win Two Tickets | Filmshow × Brooklyn Roasting Company",
  description:
    "Filmshow and Brooklyn Roasting Company are giving away two tickets to Filmshow Vol. 1 in Brooklyn.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
  },
};

export default function TicketsPage() {
  return (
    <main id="top" className="ticket-giveaway-page">
      <div className="ticket-giveaway-glow" aria-hidden="true" />
      <section className="ticket-giveaway-shell">
        <Link
          href="/"
          className="ticket-giveaway-brand"
          aria-label="Go to the Filmshow homepage"
        >
          <Image
            src="/images/official-tfs-logo.png"
            alt="Filmshow"
            width={8247}
            height={1889}
            priority
            unoptimized
          />
        </Link>

        <div className="ticket-giveaway-partner">
          <div className="ticket-giveaway-partner-lockup">
            <p>Filmshow ×</p>
            <Image
              src="/images/partners/brooklyn-roasting-company.png"
              alt="Brooklyn Roasting Company"
              width={2160}
              height={793}
              className="ticket-giveaway-partner-logo"
            />
          </div>
          <p className="ticket-giveaway-partner-copy">
            Brooklyn Roasting Company has been roasting specialty coffee in
            Brooklyn since 2010, fueling the artists, makers, and neighbors who
            make this city move. Supporting local arts isn&apos;t a side project
            for us: it&apos;s what we love. We&apos;re honored to be one of
            Filmshow&apos;s sponsors and to help put this night together.
          </p>
        </div>

        <div className="ticket-giveaway-copy">
          <p className="ticket-giveaway-eyebrow">
            Filmshow × Brooklyn Roasting Company
          </p>
          <h1>
            Win two
            <br />
            <em>tickets.</em>
          </h1>
          <p className="ticket-giveaway-intro">
            Enter for a chance to win two tickets to Filmshow Vol. 1 on
            October 3.
          </p>
        </div>

        <TicketGiveawayForm />

        <p className="ticket-giveaway-note">
          One winner. Two seats. We&apos;ll contact the winner by email.
        </p>
      </section>
    </main>
  );
}
