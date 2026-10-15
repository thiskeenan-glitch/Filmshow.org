import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "You're In | Filmshow",
  description: "Your Filmshow ticket giveaway entry has been received.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
  },
};

export default function TicketGiveawayEnteredPage() {
  return (
    <main id="top" className="ticket-giveaway-page ticket-giveaway-entered-page">
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

        <div className="ticket-giveaway-copy ticket-giveaway-entered-copy">
          <p className="ticket-giveaway-eyebrow">Entry confirmed</p>
          <h1>
            You&apos;re
            <br />
            <em>in.</em>
          </h1>
          <p className="ticket-giveaway-intro">
            Your entry has been received. Keep an eye on your inbox. Good luck.
          </p>
          <Link href="/" className="ticket-giveaway-home-link">
            Back to Filmshow
          </Link>
        </div>
      </section>
    </main>
  );
}
