import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MotionEffects } from "@/components/motion-effects";
import { V2Header } from "@/components/v2/v2-header";
import { V2Footer } from "@/components/v2/v2-footer";
import "../v2/v2.css";

export const metadata: Metadata = {
  title: "Tickets | Filmshow",
  description: "Filmshow V2 tickets will be announced soon. V1 sold 225 tickets. Short films and live experimental theater in Brooklyn.",
};

export default function TicketsPage() {
  return (
    <div className="v2-site">
      <MotionEffects />
      <V2Header />
      <main id="top" className="v2-tickets">
        <section className="v2-tickets__hero" aria-labelledby="tickets-title">
          <Image
            src="/images/v2/tickets-audience.jpg"
            alt="The audience smiling and applauding at Filmshow Volume 1 in Brooklyn"
            fill priority sizes="100vw"
          />
          <div className="v2-tickets__shade" />
          <div className="v2-tickets__heading">
            <p className="v2-kicker">Filmshow / Volume 2</p>
            <h1 id="tickets-title">Tickets.<br /><span>Announced soon.</span></h1>
            <p>Tickets for Filmshow V2 will be announced soon.</p>
          </div>
        </section>
        <section className="v2-tickets__details" aria-label="Filmshow ticket information">
          <div className="v2-tickets__stat">
            <p className="v2-kicker">Volume 1</p>
            <strong>225</strong>
            <p>tickets sold.</p>
          </div>
          <div className="v2-tickets__next">
            <p className="v2-kicker">Next up / V2</p>
            <h2>See you at<br />the next Filmshow.</h2>
            <p>Date, venue, and ticket details coming soon.</p>
            <Link href="/v2/archive/v1">Look back at Volume 1 <span>↗</span></Link>
            <Link href="/v2#trailer">Back to Filmshow <span>↗</span></Link>
          </div>
        </section>
      </main>
      <V2Footer />
    </div>
  );
}
