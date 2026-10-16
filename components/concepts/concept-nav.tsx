
import { ArrowIcon } from "@/components/arrow-icon";
import Link from "next/link";

const concepts = [
  ["/concepts/doors", "01 Doors"],
  ["/concepts/sequence", "02 Sequence"],
  ["/concepts/glass", "03 Glass"],
] as const;

export function ConceptNav({ current }: { current: "doors" | "sequence" | "glass" }) {
  return (
    <header className="concept-nav">
      <Link href="/concepts" className="concept-nav__brand" aria-label="All Filmshow concepts">
        <span className="concept-nav__mark" aria-hidden="true" />
        FILMSHOW
      </Link>
      <nav aria-label="Design concepts">
        {concepts.map(([href, label]) => (
          <Link
            key={href}
            href={href}
            className={href.endsWith(current) ? "is-current" : undefined}
          >
            {label}
          </Link>
        ))}
      </nav>
      <Link href="/" className="concept-nav__enter">
        Enter site <span aria-hidden="true"><ArrowIcon direction="up-right" /></span>
      </Link>
    </header>
  );
}
