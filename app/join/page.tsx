import { BrevoSignup } from "@/components/brevo-signup";
import Link from "next/link";

export const metadata = {
  title: "Stay in the Room | Filmshow",
  description:
    "Join the Filmshow list for future screenings, ticket drops, and film submission windows.",
};

export default function JoinPage() {
  return (
    <main className="min-h-[70vh] px-5 py-20 sm:py-28">
      <section className="mx-auto flex w-full max-w-3xl flex-col items-center text-center">
        <p className="mb-5 font-mono text-[0.68rem] uppercase tracking-[0.28em] text-stone-500">
          Filmshow
        </p>
        <h1 className="max-w-2xl font-[var(--font-display)] text-[clamp(3.2rem,9vw,7rem)] font-black uppercase leading-[0.86] tracking-[-0.02em] text-stone-100">
          Filmshow keeps moving.
        </h1>
        <p className="mt-7 max-w-xl text-[clamp(1rem,1.5vw,1.16rem)] leading-7 text-stone-400">
          Future screenings, ticket drops, behind-the-scenes notes, and new film
          submission windows. No daily noise.
        </p>
        <div className="mt-3 w-full">
          <BrevoSignup placement="submit" />
        </div>
        <p className="mt-12 text-xs uppercase tracking-[0.18em] text-stone-600">
          <Link className="transition hover:text-stone-300" href="/">
            Back to Filmshow
          </Link>
        </p>
      </section>
    </main>
  );
}
