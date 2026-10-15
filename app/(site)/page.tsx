import { IntroBackground } from "@/components/v2/intro-background";
import { PartnerLogoMarquee } from "@/components/partner-logo-marquee";
import { partnerLogos } from "@/lib/partner-logos";
import Image from "next/image";
import Link from "next/link";
import { DoorTrailer } from "@/components/v2/door-trailer";



export const metadata = {
  title: "Filmshow — Short Films and Live Theater",
  description: "Short films and live theater in Brooklyn, New York. Explore past shows, submit your film, and join the next Filmshow.",
  alternates: { canonical: "/" },
};

export default function FilmshowHome() {
  return (
    <main>
      <DoorTrailer />

      <section id="experience" className="v2-intro">
        <IntroBackground />
        <div className="v2-intro__shade" aria-hidden="true" />
        <p className="v2-kicker">Filmshow / Brooklyn, New York</p>
        <h1>IT&apos;S IN<br />THE <em>NAME.</em></h1>
        <div className="v2-intro__copy">
          <p>
            Filmshow is a live show that combines award winning short films
            and live experimental theater to create an entirely new peice of
            art. A filmshow if you will.
          </p>
          <p>
            A place to see what&apos;s happening offline, in the world,
            and on the streets.
          </p>
        </div>
      </section>

      <section className="v2-definition">
        <p className="v2-kicker">The format</p>
        <div className="v2-format-beats">
          <div><h3>SHOW</h3><p>a little bit of theater</p></div>
          <div><h3>FILM</h3><p>short film</p></div>
          <div><h3>SHOW</h3><p>a little bit of circus</p></div>
          <div><h3>FILM</h3><p>short film</p></div>
          <div className="v2-format-beats__vote"><h3>VOTE</h3><p>audience votes for their favorite film using marbles</p></div>
        </div>
      </section>

      <section id="take-part" className="v2-take-part" aria-labelledby="take-part-title">
        <p className="v2-kicker">Be part of the next one</p>
        <h2 id="take-part-title">Take part.</h2>
        <div className="v2-take-part__grid">
          <article>
            <div className="v2-take-part__photo">
              <Image src="/images/v2/the-crowd.jpg" alt="A short film projected for the Filmshow audience" fill sizes="(max-width: 760px) 100vw, 50vw" />
              <h3>Filmmakers.</h3>
            </div>
            <div className="v2-take-part__copy">
              <p className="v2-kicker">Submissions open on November 1</p>
              <p>Selected short films will screen in front of a live audience at Rollin Studios in Brooklyn, on a giant 45 foot cyc wall.</p>
              <a href="https://filmfreeway.com/TheFilmShow" target="_blank" rel="noreferrer">Submit your film <span aria-hidden="true">↗</span></a>
            </div>
          </article>
          <article>
            <div className="v2-take-part__photo">
              <Image src="/images/v2/tickets-audience.jpg" alt="Film lovers applauding at Filmshow" fill sizes="(max-width: 760px) 100vw, 50vw" />
              <h3>Film lovers.</h3>
            </div>
            <div className="v2-take-part__copy">
              <p className="v2-kicker">V2 tickets announced soon</p>
              <p>We set Filmshow in the same space where Beyoncé filmed the Single Ladies music video. Nice.</p>
              <Link href="/tickets">Get tickets <span aria-hidden="true">↗</span></Link>
            </div>
          </article>
        </div>
      </section>

      <section id="photos" className="v2-photo-collage" aria-label="Moments from Filmshow">
        {[
          { src: "/images/v2/collage/mingling.jpg", alt: "Guests mingling in the Filmshow venue" },
          { src: "/images/v2/collage/arrivals.jpg", alt: "Guests arriving for Filmshow" },
          { src: "/images/v2/collage/screening.jpg", alt: "Audience silhouettes in front of the film screen" },
          { src: "/images/v2/collage/audience.jpg", alt: "The audience watching the show" },
          { src: "/images/v2/collage/acrobatics.jpg", alt: "Two performers balancing on stage" },
          { src: "/images/v2/collage/performer.jpg", alt: "A live performer with his face projected behind him" },
          { src: "/images/v2/collage/marble-vote.jpg", alt: "An audience member casting a marble vote for their favorite film" },
          { src: "/images/v2/collage/applause.jpg", alt: "The audience smiling and applauding" },
        ].map((photo, index) => (
          <figure key={photo.src} className={`v2-photo-collage__item v2-photo-collage__item--${index + 1}`}>
            <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 760px) 50vw, 40vw" />
          </figure>
        ))}
      </section>

      <section className="v2-photo-break">
        <Image src="/images/v2/v1-performer.jpg" alt="Live performer at Filmshow Volume 1" fill sizes="100vw" />
        <div className="v2-photo-break__copy">
          <p className="v2-kicker">Experience</p>
          <h2><span className="v2-exhibition-prefix">It&apos;s an</span> exhibition.</h2>
          <p>Films and theater were never meant to live online. But maybe they can live together in a warehouse in Brooklyn in March.</p>
        </div>
      </section>

      <section id="partners" className="partner-section v2-partners" aria-labelledby="v2-partner-heading">
        <div className="container-page partner-heading">
          <p className="v2-kicker">With support from</p>
          <h2 id="v2-partner-heading">In partnership with</h2>
        </div>
        <PartnerLogoMarquee logos={partnerLogos} />
      </section>



      <section className="v2-archive-preview">
        <div className="v2-archive-preview__image">
          <Image src="/images/v2/v1-arrival.jpg" alt="Guests entering Filmshow Volume 1" fill sizes="(max-width: 760px) 100vw, 60vw" />
        </div>
        <div className="v2-archive-preview__copy">
          <p className="v2-kicker">Past shows / 001</p>
          <h2>V1</h2>
          <p>October 3, 2026<br />Brooklyn, New York</p>
          <Link href="/archive/v1">View Volume 1 <span>→</span></Link>
          <Link href="/archive" className="v2-archive-preview__all">All volumes</Link>
        </div>
      </section>
    </main>
  );
}
