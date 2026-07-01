"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import { ButtonLink } from "./button-link";

const LOGO_SRC = "/images/official-tfs-logo.png";
const COWBOY_SRC = "/images/header-cowboy.png";
const CONTACT_EMAIL = "info@filmshow.org";
const FILMFREEWAY_URL = "https://filmfreeway.com/TheFilmShow";
const LUMA_EVENT_URL = "https://luma.com/wqhep4p3";

export function SiteFooter() {
  const pathname = usePathname();

  const handleTopClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const top = document.getElementById("top");
    if (!top) return;

    event.preventDefault();
    top.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.pushState(null, "", "#top");
  };

  const footerOnly = (
    <footer className="poster-field border-t border-stone-100/10 py-14">
      <div className="container-page text-stone-300">
        <div className="footer-brand-row">
          <Link
            href="/#top"
            data-scroll-top
            onClick={handleTopClick}
            className="footer-logo-link inline-flex w-fit cursor-pointer items-center transition hover:opacity-80"
            aria-label="Scroll to the top of Film Show home page"
            title="Back to top"
          >
            <Image
              src={LOGO_SRC}
              alt="Film Show"
              width={3400}
              height={1362}
              unoptimized
              className="site-logo-footer"
            />
          </Link>
          <Link
            href="/#top"
            data-scroll-top
            onClick={handleTopClick}
            className="footer-cowboy-link inline-flex w-fit cursor-pointer items-center justify-center transition hover:opacity-80"
            aria-label="Scroll to the top of Film Show home page"
            title="Back to top"
          >
            <Image
              src={COWBOY_SRC}
              alt=""
              width={620}
              height={820}
              unoptimized
              aria-hidden="true"
              className="footer-cowboy"
            />
          </Link>
        </div>
      </div>
    </footer>
  );

  if (pathname === "/") {
    return footerOnly;
  }

  return (
    <>
      <section id="contact" className="section-pad border-t border-stone-100/10">
        <div className="container-page">
          <div className="grid gap-8 md:grid-cols-[0.72fr_1.28fr] md:items-start">
            <div>
              <p className="copy-wide small-label text-red-300">Contact</p>
              <h2 className="section-kicker mt-5 text-stone-100">Get in touch</h2>
            </div>
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
            </div>
          </div>
          <div className="footer-cta-center">
            <p className="footer-cta-date copy-wide font-extrabold text-red-300">
              FILM SHOW | VOL. 1 | 10.8.26 | NEW YORK CITY
            </p>
            <div className="footer-cta-buttons mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={LUMA_EVENT_URL} newTab>
                Get Tickets
              </ButtonLink>
              <ButtonLink href={FILMFREEWAY_URL} variant="secondary" newTab>
                Submit Your Film
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>

      {footerOnly}
    </>
  );
}
