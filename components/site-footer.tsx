import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "./button-link";

const COWBOY_SRC = "/images/header-cowboy.png";
const CONTACT_EMAIL = "info@thisbird.org";
const FILMFREEWAY_URL = "https://filmfreeway.com/TheFilmShow";
const LUMA_EVENT_URL = "https://luma.com/wqhep4p3";

export function SiteFooter() {
  return (
    <>
      <section className="section-pad border-t border-stone-100/10">
        <div className="container-page">
          <div className="grid gap-8 md:grid-cols-[0.72fr_1.28fr] md:items-start">
            <h2 className="section-kicker text-stone-100">Get in touch</h2>
            <div>
              <p className="body-large max-w-2xl text-stone-300">
                For submissions, sponsorships, venue questions, press, or anything else:
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="copy-wide mt-6 inline-block text-sm font-bold text-red-300 transition hover:text-stone-100"
              >
                {CONTACT_EMAIL}
              </a>
              <p className="footer-cta-date copy-wide text-xs text-red-300">
                Vol. 1 | 6.8.26 | NYC
              </p>
              <div className="footer-cta-buttons mt-8 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={LUMA_EVENT_URL} newTab>
                  Get Tickets
                </ButtonLink>
                <ButtonLink href={FILMFREEWAY_URL} variant="secondary" newTab>
                  Submit Film
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="poster-field border-t border-stone-100/10 py-14">
        <div className="container-page text-stone-300">
          <div className="footer-brand-row">
            <Link
              href="/#top"
              data-scroll-top
              className="footer-cowboy-link inline-flex w-fit cursor-pointer items-center transition hover:opacity-80"
              aria-label="Scroll to the top of Film Show home page"
              title="Back to top"
            >
              <Image
                src={COWBOY_SRC}
                alt="Back to top"
                width={620}
                height={820}
                unoptimized
                className="footer-cowboy"
              />
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
