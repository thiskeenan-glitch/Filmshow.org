import Image from "next/image";
import Link from "next/link";

export const metadata = {
  alternates: { canonical: "/archive/toy-gun-premiere" },
  title: "Toy Gun Premiere Archive",
  description: "The Toy Gun premiere, before Filmshow Volume 1.",
};

export default function ToyGunPremierePage() {
  return (
    <main className="v2-v1 v2-premiere">
      <section className="v2-v1-hero">
        <Image src="/images/the-team.jpg" alt="The team gathered beside a Toy Gun poster" fill priority sizes="100vw" />
        <div className="v2-v1-hero__shade" />
        <p>Archive / Before Volume 1</p>
        <h1>Toy Gun<br />Premiere.</h1>
      </section>
      <section className="v2-premiere__photos">
        <p className="v2-kicker">Before Filmshow V1</p>
        <h2>Where it began.</h2>
        <p>The Toy Gun premiere came before Filmshow Volume 1.</p>
        <Image src="/images/the-team.jpg" alt="The team at the Toy Gun poster" width={5712} height={4284} sizes="(max-width: 760px) 100vw, 80vw" />
        <Link href="/archive/v1">Next: Volume 1 →</Link>
        <Link href="/archive">Back to archive →</Link>
      </section>
    </main>
  );
}
