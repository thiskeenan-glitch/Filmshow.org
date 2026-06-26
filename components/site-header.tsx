"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";

const LOGO_SRC = "/images/official-tfs-logo.png";
const COWBOY_SRC = "/images/header-cowboy.png";
const FILMFREEWAY_URL = "https://filmfreeway.com/TheFilmShow";
const LUMA_EVENT_URL = "https://luma.com/wqhep4p3";

const navItems = [
  { href: "/#about", label: "About" },
  { href: "/#photos", label: "Photos" },
  { href: "/#cash", label: "Cash" },
  { href: "/#submit", label: "Submit" },
  { href: "/#tickets", label: "Tickets" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [hasScrolled, setHasScrolled] = useState(false);
  const [showFullLogo, setShowFullLogo] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const navTrackRef = useRef<HTMLDivElement>(null);
  const navLinkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [dotStyle, setDotStyle] = useState({ left: 0, visible: false });
  const isActive = (href: string) => {
    if (href.includes("#")) {
      const hash = href.slice(href.indexOf("#"));
      return (pathname === "/" || pathname.endsWith("index.html")) && activeHash === hash;
    }

    return href === pathname;
  };

  const handleSectionClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    const hashIndex = href.indexOf("#");
    if (hashIndex === -1) return;

    const hash = href.slice(hashIndex);
    const section = document.getElementById(hash.slice(1));
    if (!section) return;

    event.preventDefault();
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.pushState(null, "", hash);
    setActiveHash(hash);
  };

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const hero = document.getElementById("top");
      const heroBottom = hero?.getBoundingClientRect().bottom ?? window.innerHeight;
      const viewportHeight = window.innerHeight;

      setHasScrolled(window.scrollY > 10);
      setShowFullLogo((current) =>
        current
          ? heroBottom < viewportHeight * 0.62
          : heroBottom < viewportHeight * 0.42,
      );

      if (!(pathname === "/" || pathname.endsWith("index.html"))) {
        setActiveHash("");
        return;
      }

      if (heroBottom > viewportHeight * 0.58) {
        setActiveHash("");
        return;
      }

      const headerOffset = 132;
      const activeSection = navItems
        .map((item) => {
          const id = item.href.slice(item.href.indexOf("#") + 1);
          const el = document.getElementById(id);
          if (!el) return null;

          const rect = el.getBoundingClientRect();
          return {
            hash: `#${id}`,
            top: rect.top,
            bottom: rect.bottom,
          };
        })
        .filter((section): section is { hash: string; top: number; bottom: number } => Boolean(section))
        .find((section) => section.top <= headerOffset && section.bottom > headerOffset);

      if (activeSection) {
        setActiveHash(activeSection.hash);
        return;
      }

      const nearestSection = navItems
        .map((item) => {
          const id = item.href.slice(item.href.indexOf("#") + 1);
          const el = document.getElementById(id);
          if (!el) return null;

          return {
            hash: `#${id}`,
            distance: Math.abs(el.getBoundingClientRect().top - headerOffset),
          };
        })
        .filter((section): section is { hash: string; distance: number } => Boolean(section))
        .sort((a, b) => a.distance - b.distance)[0];

      setActiveHash(nearestSection?.hash ?? "");
    };

    const scheduleUpdate = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    const updateHash = () => {
      window.setTimeout(update, 180);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", updateHash);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", updateHash);
    };
  }, [pathname]);

  useEffect(() => {
    const hash = activeHash;
    const track = navTrackRef.current;
    const link = hash ? navLinkRefs.current[hash] : null;

    if (!track || !link || !(pathname === "/" || pathname.endsWith("index.html"))) {
      setDotStyle((current) => ({ ...current, visible: false }));
      return;
    }

    const updateDot = () => {
      const trackRect = track.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      setDotStyle({
        left: linkRect.left - trackRect.left + linkRect.width / 2,
        visible: true,
      });
    };

    updateDot();
    window.addEventListener("resize", updateDot);

    return () => {
      window.removeEventListener("resize", updateDot);
    };
  }, [activeHash, pathname]);

  return (
    <header className={`texture-header top-0 z-40 w-full border-b ${hasScrolled ? "is-scrolled" : ""}`}>
      <nav className="container-page py-3 sm:py-4">
        <div className="flex items-center justify-between gap-x-4">
          <Link
            href="/#top"
            data-scroll-top
            className={`header-brand ${showFullLogo ? "is-logo-visible" : "is-cowboy-visible"}`}
            aria-label="Scroll to the top of Film Show home page"
            title="Back to top"
          >
            <Image
              src={COWBOY_SRC}
              alt=""
              width={620}
              height={820}
              priority
              unoptimized
              aria-hidden="true"
              className="header-brand-image header-brand-cowboy"
            />
            <Image
              src={LOGO_SRC}
              alt="Film Show"
              width={3400}
              height={1362}
              priority
              unoptimized
              className="header-brand-image header-brand-logo"
            />
          </Link>
          <div className="flex items-center justify-end gap-x-4 text-[0.68rem] uppercase tracking-[0.16em] text-stone-500">
            <div ref={navTrackRef} className="desktop-nav-track hidden items-center justify-end gap-x-5 lg:flex">
              <span
                className={`nav-active-dot ${dotStyle.visible ? "is-visible" : ""}`}
                style={{ transform: `translate3d(${dotStyle.left}px, 0, 0) translateX(-50%)` }}
                aria-hidden="true"
              />
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(event) => handleSectionClick(event, item.href)}
                  ref={(node) => {
                    navLinkRefs.current[item.href.slice(item.href.indexOf("#"))] = node;
                  }}
                  className={`poster-link transition hover:text-red-200 ${isActive(item.href) ? "is-active" : ""}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={LUMA_EVENT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="button-shift header-ticket-button inline-flex min-h-11 shrink-0 items-center justify-center border border-stone-100/25 bg-stone-100 px-3 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-black hover:border-stone-100/60 hover:bg-transparent hover:text-stone-100 sm:px-5 sm:text-[0.64rem] sm:tracking-[0.12em]"
              >
                Get Tickets
              </Link>
              <Link
                href={FILMFREEWAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="button-shift inline-flex min-h-11 shrink-0 items-center justify-center bg-red-700 px-3 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-black hover:bg-stone-100 sm:px-5 sm:text-[0.64rem] sm:tracking-[0.12em]"
              >
                Submit Film
              </Link>
            </div>
          </div>
        </div>
        <div className="mobile-header-links lg:hidden" aria-label="Section navigation">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={(event) => handleSectionClick(event, item.href)}
              className={`poster-link shrink-0 transition hover:text-red-200 ${isActive(item.href) ? "is-active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  );
}
