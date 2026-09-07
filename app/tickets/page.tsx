import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TicketGiveawayForm } from "./ticket-giveaway-form";

export const metadata: Metadata = {
  title: "Win Two Tickets | Filmshow",
  description:
    "Enter for a chance to win two tickets to Filmshow Vol. 1 in Brooklyn.",
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
            width={3400}
            height={1362}
            priority
            unoptimized
          />
        </Link>

        <div className="ticket-giveaway-copy">
          <p className="ticket-giveaway-eyebrow">Filmshow Vol. 1 · Brooklyn</p>
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
