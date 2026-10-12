import Image from "next/image";
import Link from "next/link";
import { DoorTrailer } from "@/components/v2/door-trailer";

export default function FilmshowV2Home() {
  return (
    <main>
      <DoorTrailer />

      <section id="experience" className="v2-intro">
        <p className="v2-kicker">Filmshow / Brooklyn, New York</p>
        <h1>Short films.<br />Live acts.<br />One night.</h1>
        <div className="v2-intro__copy">
          <p>
            Filmshow is a twice-yearly Brooklyn event. A curated program of short films
            is presented alongside original live performance.
          </p>
          <p>
            The night alternates between the screen and the room: SHOW / FILM / SHOW /
            FILM. One ticket covers the full program.
          </p>
        </div>
      </section>

      <section className="v2-rhythm" aria-label="How Filmshow works">
        <article className="v2-rhythm__show">
          <div className="v2-rhythm__image">
            <Image src="/images/v2/v1-acrobatics.jpg" alt="Live acrobatics at Filmshow Volume 1" fill sizes="(max-width: 760px) 100vw, 50vw" />
          </div>
          <span>01</span><h2>SHOW</h2>
          <p>Theater, clowning, circus, comedy, and other live work performed between films.</p>
        </article>
        <article className="v2-rhythm__film">
          <div className="v2-rhythm__image">
            <Image src="/images/v2/v1-audience.jpg" alt="Audience watching a short film at Filmshow Volume 1" fill sizes="(max-width: 760px) 100vw, 50vw" />
          </div>
          <span>02</span><h2>FILM</h2>
          <p>Short films, 15 minutes or less, selected from filmmakers around the world.</p>
        </article>
      </section>

      <section className="v2-definition">
        <p className="v2-kicker">The format</p>
        <div className="v2-definition__sequence" aria-label="Show, film, show, film">
          <span>SHOW</span><i>/</i><span>FILM</span><i>/</i><span>SHOW</span><i>/</i><span>FILM</span>
        </div>
        <div className="v2-definition__facts">
          <div><span>Where</span><strong>Brooklyn, New York</strong></div>
          <div><span>When</span><strong>Twice yearly</strong></div>
          <div><span>Films</span><strong>15 minutes or less</strong></div>
          <div><span>In the room</span><strong>Screening + live show</strong></div>
        </div>
      </section>

      <section className="v2-photo-break">
        <Image src="/images/v2/v1-performer.jpg" alt="Live performer at Filmshow Volume 1" fill sizes="100vw" />
        <p>THIS IS NOT A FESTIVAL.</p>
      </section>

      <section className="v2-actions">
        <p className="v2-kicker">Attend or take part</p>
        <div>
          <article>
            <span>For the audience</span>
            <h2>Come to<br />the next show.</h2>
            <p>Event details and ticket availability appear here when the next volume is announced.</p>
            <Link href="/tickets">Ticket information <b>↗</b></Link>
          </article>
          <article>
            <span>For filmmakers</span>
            <h2>Put your film<br />in the room.</h2>
            <p>Filmshow accepts short films across genres from filmmakers anywhere.</p>
            <a href="https://filmfreeway.com/TheFilmShow" target="_blank" rel="noreferrer">Submission details <b>↗</b></a>
          </article>
        </div>
      </section>

      <section className="v2-archive-preview">
        <div className="v2-archive-preview__image">
          <Image src="/images/v2/v1-arrival.jpg" alt="Guests entering Filmshow Volume 1" fill sizes="(max-width: 760px) 100vw, 60vw" />
        </div>
        <div className="v2-archive-preview__copy">
          <p className="v2-kicker">Past shows / 001</p>
          <h2>V1</h2>
          <p>October 3, 2026<br />Brooklyn, New York</p>
          <Link href="/v2/archive/v1">View Volume 1 <span>→</span></Link>
          <Link href="/v2/archive" className="v2-archive-preview__all">All volumes</Link>
        </div>
      </section>
    </main>
  );
}
