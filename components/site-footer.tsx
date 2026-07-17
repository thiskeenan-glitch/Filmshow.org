"use client";

import Image from "next/image";
import Link from "next/link";
import type { MouseEvent } from "react";
import { BrevoSignup } from "./brevo-signup";

const LOGO_SRC = "/images/official-tfs-logo.png";
const COWBOY_SRC = "/images/header-cowboy.png";

export function SiteFooter() {
  const handleTopClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const top = document.getElementById("top");
    if (!top) return;

    event.preventDefault();
    top.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.pushState(null, "", "#top");
  };

  return (
    <footer className="poster-field border-t border-stone-100/10 py-14">
      <div className="container-page text-stone-300">
        <BrevoSignup placement="footer" />
        <p className="footer-note">See you there.</p>
        <div className="footer-brand-row">
          <Link
            href="/#top"
            data-scroll-top
            onClick={handleTopClick}
            className="footer-logo-link inline-flex w-fit cursor-pointer items-center transition hover:opacity-80"
            aria-label="Scroll to the top of Filmshow home page"
            title="Back to top"
          >
            <Image
              src={LOGO_SRC}
              alt="Filmshow"
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
            aria-label="Scroll to the top of Filmshow home page"
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
}
