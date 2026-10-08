import Link from "next/link";
import type { CSSProperties } from "react";

const concepts = [
  {
    number: "01",
    title: "The Two Doors",
    href: "/concepts/doors",
    description: "An architectural threshold. Choose cinema or live spectacle.",
    image: "/images/hero/the-space-hero.jpg",
  },
  {
    number: "02",
    title: "Film / Show Sequence",
    href: "/concepts/sequence",
    description: "The rhythm of the night translated into an editorial scroll.",
    image: "/images/optimized/gallery-3-people.jpg",
  },
  {
    number: "03",
    title: "The Glass Theater",
    href: "/concepts/glass",
    description: "A translucent wordmark separates, reveals, and reunites.",
    image: "/images/optimized/gallery-space.jpg",
  },
] as const;

export default function ConceptsIndex() {
  return (
    <main className="concept-index">
      <div className="concept-index__intro">
        <p className="concept-kicker">Filmshow / Digital Home Study</p>
        <h1>Three ways<br />through the glass.</h1>
        <p>Independent prototypes for a cultural event that refuses to behave like a festival.</p>
      </div>
      <div className="concept-index__grid">
        {concepts.map((concept) => (
          <Link
            href={concept.href}
            key={concept.href}
            className="concept-card"
            style={{ "--concept-image": `url(${concept.image})` } as CSSProperties}
          >
            <span className="concept-card__number">{concept.number}</span>
            <span className="concept-card__body">
              <strong>{concept.title}</strong>
              <span>{concept.description}</span>
            </span>
            <span className="concept-card__arrow" aria-hidden="true">↗</span>
          </Link>
        ))}
      </div>
      <p className="concept-index__note">Concept study · October 2026 · Brooklyn, New York</p>
    </main>
  );
}
