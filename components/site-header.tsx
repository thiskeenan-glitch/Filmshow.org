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
  { href: "/#tickets", label: "Tickets" },
  { href: "/#submit", label: "Submit" },
  { href: "/#photos", label: "Photos" },
  { href: "/#about", label: "About" },
  { href: "/#prize", label: "Prize" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [hasScrolled, setHasScrolled] = useState(false);
  const [showFullLogo, setShowFullLogo] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navTrackRef = useRef<HTMLDivElement>(null);
  const navLinkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, visible: false });
  const isActive = (href: string) => {
    if (href.includes("#")) {
      const hash = href.slice(href.indexOf("#"));
      return activeHash === hash;
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
    setIsMobileMenuOpen(false);
  };

  const handleTopClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const top = document.getElementById("top");
    if (!top) return;

    event.preventDefault();
    top.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.pushState(null, "", "#top");
    setActiveHash("");
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobileMenuOpen]);

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

      const sections = navItems
        .map((item) => {
          const id = item.href.slice(item.href.indexOf("#") + 1);
          const el = document.getElementById(id);
          if (!el) return null;

          return {
            hash: `#${id}`,
            el,
          };
        })
        .filter((section): section is { hash: string; el: HTMLElement } => Boolean(section));

      if (!sections.length) {
        setActiveHash("");
        return;
      }

      const headerHeight =
        document.querySelector<HTMLElement>(".texture-header")?.getBoundingClientRect().height ?? 108;
      const headerOffset = Math.min(window.innerHeight * 0.42, headerHeight + 28);

      if (hero && heroBottom > headerOffset + 80) {
        setActiveHash("");
        return;
      }

      const activeSection = sections
        .map((section) => {
          const rect = section.el.getBoundingClientRect();
          return {
            hash: section.hash,
            top: rect.top,
            bottom: rect.bottom,
          };
        })
        .find((section) => section.top <= headerOffset && section.bottom > headerOffset);

      if (activeSection) {
        setActiveHash(activeSection.hash);
        return;
      }

      const nearestSection = sections
        .map((section) => ({
          hash: section.hash,
          distance: Math.abs(section.el.getBoundingClientRect().top - headerOffset),
        }))
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

    if (!track || !link) {
      setIndicatorStyle((current) => ({ ...current, visible: false }));
      return;
    }

    const updateIndicator = () => {
      const trackRect = track.getBoundingClientRect();
      const linkRect = link.getBoundingClientRect();
      setIndicatorStyle({
        left: linkRect.left - trackRect.left + linkRect.width / 2,
        visible: true,
      });
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);

    return () => {
      window.removeEventListener("resize", updateIndicator);
    };
  }, [activeHash]);

  return (
    <header className={`texture-header top-0 z-40 w-full border-b ${hasScrolled ? "is-scrolled" : ""}`}>
      <nav className="container-page py-3 sm:py-4">
        <div className="flex items-center justify-between gap-x-4">
          <Link
            href="/#top"
            data-scroll-top
            onClick={handleTopClick}
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
                className={`nav-active-cowboy ${indicatorStyle.visible ? "is-visible" : ""}`}
                style={{ transform: `translate3d(${indicatorStyle.left}px, 0, 0) translateX(-50%)` }}
                aria-hidden="true"
              >
                <Image
                  key={activeHash}
                  src={COWBOY_SRC}
                  alt=""
                  width={620}
                  height={820}
                  unoptimized
                  aria-hidden="true"
                  className="nav-active-cowboy-image"
                />
              </span>
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
            <div className="hidden shrink-0 items-center gap-2 lg:flex">
              <Link
                href={LUMA_EVENT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="button-shift header-cta header-cta--tickets"
              >
                Get Tickets
              </Link>
              <Link
                href={FILMFREEWAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="button-shift header-cta header-cta--submit"
              >
                Submit Film
              </Link>
            </div>
            <button
              type="button"
              className="mobile-menu-toggle lg:hidden"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
            >
              {isMobileMenuOpen ? "Close" : "Menu"}
            </button>
          </div>
        </div>
        <div
          id="mobile-menu"
          className={`mobile-header-menu lg:hidden ${isMobileMenuOpen ? "is-open" : ""}`}
          aria-label="Section navigation"
        >
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
