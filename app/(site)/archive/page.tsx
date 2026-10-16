
import { ArrowIcon } from "@/components/arrow-icon";
import Image from "next/image";
import Link from "next/link";

export const metadata = {
  alternates: { canonical: "/archive" },
  title: "Archive",
  description: "The Filmshow archive, volume by volume.",
};

export default function ArchivePage() {
  return (
    <main className="v2-archive-index">
      <header>
        <p className="v2-kicker">Filmshow archive</p>
        <h1>Every volume.</h1>
      </header>
      <div className="v2-volume-grid">
        <Link href="/archive/v1" className="v2-volume-card v2-volume-card--active">
          <Image src="/images/v2/v1-screen.jpg" alt="Filmshow Volume 1 screening" fill sizes="(max-width: 760px) 100vw, 50vw" />
          <div><span>001</span><strong>V1</strong><p>October 3, 2026<br />Brooklyn, New York</p><b>View archive <ArrowIcon direction="right" /></b></div>
        </Link>
        <Link href="/archive/toy-gun-premiere" className="v2-volume-card v2-volume-card--active v2-volume-card--premiere">
          <Image src="/images/the-team.jpg" alt="The team gathered beside a Toy Gun poster" fill sizes="(max-width: 760px) 100vw, 50vw" />
          <div><span>Before Volume 1</span><strong>Toy Gun<br />Premiere</strong><p>Where it began.</p><b>View archive <ArrowIcon direction="right" /></b></div>
        </Link>
        <article className="v2-volume-card v2-volume-card--future">
          <div><span>002</span><strong>V2</strong><p>Date and location<br />to be announced</p><b>Coming next</b></div>
        </article>
      </div>
    </main>
  );
}
