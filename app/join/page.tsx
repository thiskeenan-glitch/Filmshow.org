import { BrevoSignup } from "@/components/brevo-signup";
import Link from "next/link";

export const metadata = {
  title: "Stay in the Room | Filmshow",
  description:
    "Join the Filmshow list for future screenings, ticket drops, and film submission windows.",
};

export default function JoinPage() {
  return (
    <main className="site-page join-page">
      <section className="join-page-shell">
        <p className="eyebrow">FILMSHOW</p>
        <h1>Stay in the room.</h1>
        <p className="join-page-intro">
          Future screenings, ticket drops, behind-the-scenes notes, and new film
          submission windows. No daily noise.
        </p>
        <BrevoSignup placement="footer" />
        <p className="join-page-back">
          <Link href="/">Back to Filmshow</Link>
        </p>
      </section>
    </main>
  );
}
