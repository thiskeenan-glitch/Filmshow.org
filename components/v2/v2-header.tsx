import Link from "next/link";

export function V2Header() {
  return (
    <header className="v2-header">
      <Link href="/v2#trailer" className="v2-header__brand"><i />FILMSHOW</Link>
      <nav aria-label="Filmshow V2 navigation">
        <Link href="/v2#experience">Experience</Link>
        <Link href="/v2/archive">Archive</Link>
        <a href="https://filmfreeway.com/TheFilmShow" target="_blank" rel="noreferrer">Submit</a>
        <Link href="/tickets" className="v2-header__ticket">Tickets</Link>
      </nav>
    </header>
  );
}
