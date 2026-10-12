import Image from "next/image";
import Link from "next/link";
import { v1Films, v1Gallery } from "@/lib/v2-archive";

export const metadata = {
  title: "Volume 1 Archive",
  description: "Filmshow Volume 1 — October 3, 2026 in Brooklyn, New York.",
};

export default function VolumeOnePage() {
  return (
    <main className="v2-v1">
      <section className="v2-v1-hero">
        <Image src="/images/v2/v1-screen.jpg" alt="Filmshow Volume 1 audience and screen" fill priority sizes="100vw" />
        <div className="v2-v1-hero__shade" />
        <p>Archive / 001</p>
        <h1>V1</h1>
        <div><span>October 3, 2026</span><span>Brooklyn, New York</span></div>
      </section>

      <section className="v2-v1-intro">
        <p className="v2-kicker">Volume 1</p>
        <h2>The first Filmshow paired four short films with live performance.</h2>
        <div>
          <p>The program moved between the screen and the stage throughout the night.</p>
          <p>The archive below documents the films, the room, the audience, and the live show.</p>
        </div>
      </section>

      <section className="v2-v1-films">
        <header><p className="v2-kicker">Screened films</p><h2>The V1 program</h2></header>
        <div>
          {v1Films.map((film, index) => (
            <article key={film.title}>
              <span>0{index + 1}</span>
              <div className="v2-v1-films__poster"><Image src={film.poster} alt={`${film.title} poster`} fill sizes="(max-width: 760px) 50vw, 25vw" /></div>
              <h3>{film.title}</h3>
              <p>Directed by {film.director}<br />{film.runtime} · {film.country}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="v2-v1-gallery">
        <header><p className="v2-kicker">In the room</p><h2>Volume 1 in pictures.</h2></header>
        <div>
          {v1Gallery.map((photo, index) => (
            <figure key={photo.src} className={`v2-v1-gallery__item v2-v1-gallery__item--${index + 1}`}>
              <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 760px) 100vw, 60vw" />
            </figure>
          ))}
        </div>
      </section>

      <section className="v2-v1-pending">
        <p className="v2-kicker">Archive notes</p>
        <h2>Awards, press, and filmmaker materials will be added when the records are confirmed.</h2>
      </section>

      <section className="v2-v1-next">
        <p className="v2-kicker">Next</p>
        <h2>V2</h2>
        <p>Date and location to be announced.</p>
        <div><Link href="/tickets">Ticket information ↗</Link><Link href="/v2/archive">Back to archive →</Link></div>
      </section>
    </main>
  );
}
