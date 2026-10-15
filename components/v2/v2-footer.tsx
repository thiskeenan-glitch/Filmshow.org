import Link from "next/link";

export function V2Footer() {
  return (
    <footer className="v2-footer">
      <div><i />FILMSHOW</div>
      <p>Short films and live theater.<br />Brooklyn, New York.</p>
      <div className="v2-footer__links">
        <Link href="/archive">Archive</Link>
        <a href="https://filmfreeway.com/TheFilmShow" target="_blank" rel="noreferrer">Submit a film</a>
        <Link href="/tickets">Tickets</Link>
      </div>
      <span>© {new Date().getFullYear()} Filmshow</span>
    </footer>
  );
}
