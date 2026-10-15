import Link from "next/link";

export function V2Header() {
  return (
    <header className="v2-header">
      <Link href="/#trailer" className="v2-header__brand"><i />FILMSHOW</Link>
      <nav aria-label="Filmshow navigation">
        <Link href="/#experience">Experience</Link>
        <Link href="/archive">Archive</Link>
        <a href="https://filmfreeway.com/TheFilmShow" target="_blank" rel="noreferrer">Submit</a>
        <Link href="/tickets" className="v2-header__ticket">Tickets</Link>
      </nav>
    </header>
  );
}
