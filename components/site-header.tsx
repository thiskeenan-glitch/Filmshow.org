"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { LumaCheckoutLink } from "./luma-checkout-link";

const LOGO_SRC = "/images/official-tfs-logo.png";
const COWBOY_SRC = "/images/header-cowboy.png";
const FILMFREEWAY_URL = "https://filmfreeway.com/TheFilmShow";
const ORIGINALS_APPLICATION_URL = "/originals#application";

const navItems = [
  { href: "/#what-is-this", label: "About" },
  { href: "/#photos", label: "Photos" },
  { href: "/#submit", label: "Submit" },
  { href: "/originals", label: "Grant" },
  { href: "/#why-submit", label: "Why?" },
];

const getIndicatorSrc = () =>
  typeof window !== "undefined" && window.location.protocol === "file:"
    ? "./images/header-cowboy.png"
    : COWBOY_SRC;

export function SiteHeader() {
  const pathname = usePathname();
  const [hasScrolled, setHasScrolled] = useState(false);
  const [showFullLogo, setShowFullLogo] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [renderDesktopChrome, setRenderDesktopChrome] = useState(true);
  const [indicatorAssetOk, setIndicatorAssetOk] = useState(false);
  const [indicatorSrc] = useState(getIndicatorSrc);
  const navTrackRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const navLinkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const manualActiveUntilRef = useRef(0);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, visible: false });

  const measureIndicatorForLink = (link: HTMLAnchorElement | null) => {
    const track = navTrackRef.current;

    if (!track || !link || window.innerWidth < 1024) {
      setIndicatorStyle((current) => ({ ...current, visible: false }));
      return;
    }

    const trackRect = track.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();

    setIndicatorStyle({
      left: linkRect.left - trackRect.left + linkRect.width / 2,
      visible: true,
    });
  };

  const isActive = (href: string) => {
    if (href.includes("#")) {
      const hash = href.slice(href.indexOf("#"));
      return activeHash === hash;
    }

    return href === pathname;
  };

  const handleSectionClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname !== "/") {
      setIsMobileMenuOpen(false);
      return;
    }

    const hashIndex = href.indexOf("#");
    if (hashIndex === -1) {
      setIsMobileMenuOpen(false);
      return;
    }

    const hash = href.slice(hashIndex);
    const section = document.getElementById(hash.slice(1));
    if (!section) return;

    event.preventDefault();
    const clickedLink = event.currentTarget;
    manualActiveUntilRef.current = window.performance.now() + 900;
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.pushState(null, "", hash);
    setActiveHash(hash);
    measureIndicatorForLink(clickedLink);
    window.setTimeout(() => measureIndicatorForLink(clickedLink), 120);
    window.setTimeout(() => measureIndicatorForLink(navLinkRefs.current[hash] ?? clickedLink), 520);
    window.setTimeout(() => {
      manualActiveUntilRef.current = 0;
      measureIndicatorForLink(navLinkRefs.current[hash] ?? clickedLink);
    }, 940);
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

  const handleMobileMenuClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target;

    if (target instanceof Element && target.closest("a, button")) {
      setIsMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const updateViewport = () => setRenderDesktopChrome(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);

    return () => {
      mediaQuery.removeEventListener("change", updateViewport);
    };
  }, []);

  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    const handlePagePointerDown = (event: PointerEvent) => {
      const target = event.target;

      if (target instanceof Node && headerRef.current?.contains(target)) {
        return;
      }

      setIsMobileMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePagePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      document.removeEventListener("pointerdown", handlePagePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const image = new window.Image();

    image.onload = () => setIndicatorAssetOk(true);
    image.onerror = () => setIndicatorAssetOk(false);
    image.src = indicatorSrc;
  }, [indicatorSrc]);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      const hero = document.getElementById("top");
      const heroBottom = hero?.getBoundingClientRect().bottom ?? window.innerHeight;
      const scrollY = window.scrollY;

      setHasScrolled(window.scrollY > 10);
      setShowFullLogo((current) =>
        current
          ? scrollY > 120
          : scrollY > 145,
      );

      const sections = navItems
        .filter((item) => item.href.includes("#"))
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
      const activationOffset = headerHeight + (window.innerWidth >= 1024 ? 150 : 118);

      if (window.performance.now() < manualActiveUntilRef.current) {
        return;
      }

      if (hero && heroBottom > activationOffset + 80) {
        setActiveHash("");
        return;
      }

      const passedSections = sections
        .map((section) => {
          const rect = section.el.getBoundingClientRect();
          return {
            hash: section.hash,
            top: rect.top,
          };
        })
        .filter((section) => section.top <= activationOffset)
        .sort((a, b) => b.top - a.top);

      if (passedSections.length) {
        setActiveHash(passedSections[0]?.hash ?? "");
        return;
      }

      const nearestSection = sections
        .map((section) => ({
          hash: section.hash,
          distance: Math.abs(section.el.getBoundingClientRect().top - activationOffset),
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

    const updateIndicator = () => measureIndicatorForLink(link);

    updateIndicator();
    window.addEventListener("resize", updateIndicator);

    return () => {
      window.removeEventListener("resize", updateIndicator);
    };
  }, [activeHash]);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header
      ref={headerRef}
      className={`texture-header top-0 z-40 w-full border-b ${
        hasScrolled ? "is-scrolled" : ""
      } ${showFullLogo ? "is-brand-swapped" : ""}`}
    >
      <nav className="container-page py-3 sm:py-4">
        <div className="header-bar flex items-center justify-between gap-x-4">
          <div className="mobile-header-left lg:hidden">
            <Link
              href="/#top"
              data-scroll-top
              onClick={handleTopClick}
              className="mobile-header-cowboy-link"
              aria-label="Scroll to the top of Filmshow home page"
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
                className="mobile-header-cowboy"
              />
            </Link>
          </div>
          <div className="mobile-header-center lg:hidden">
            <Link
              href="/#top"
              data-scroll-top
              onClick={handleTopClick}
              className="mobile-header-wordmark"
              aria-label="Scroll to the top of Filmshow home page"
              title="Back to top"
            >
              <Image
                src={LOGO_SRC}
                alt="Filmshow"
                width={3400}
                height={1362}
                priority
                unoptimized
                className="mobile-header-wordmark-image"
              />
            </Link>
          </div>
          <div className="mobile-header-right lg:hidden">
            <button
              type="button"
              className="mobile-menu-toggle"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              onClick={() => setIsMobileMenuOpen((open) => !open)}
            >
              {isMobileMenuOpen ? "Close" : "Menu"}
            </button>
          </div>
          {renderDesktopChrome ? (
            <Link
              href="/#top"
              data-scroll-top
              onClick={handleTopClick}
              className="header-brand hidden lg:block"
              aria-label="Scroll to the top of Filmshow home page"
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
                className="header-brand-image header-cowboy"
              />
              <Image
                src={LOGO_SRC}
                alt="Filmshow"
                width={3400}
                height={1362}
                priority
                unoptimized
                className="header-brand-image header-logo"
              />
            </Link>
          ) : null}
          {renderDesktopChrome ? (
            <div className="header-actions flex items-center justify-end gap-x-4 text-[0.68rem] uppercase tracking-[0.16em] text-stone-500">
            <div ref={navTrackRef} className="desktop-nav-track hidden items-center justify-end gap-x-5 lg:flex">
              <span
                className={`nav-active-cowboy ${
                  indicatorStyle.visible && indicatorAssetOk ? "is-visible" : ""
                }`}
                style={{ transform: `translate3d(${indicatorStyle.left}px, 0, 0) translateX(-50%)` }}
                aria-hidden="true"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={activeHash}
                  src={indicatorSrc}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                  className="nav-active-cowboy-image"
                  onLoad={() => setIndicatorAssetOk(true)}
                  onError={() => setIndicatorAssetOk(false)}
                />
              </span>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={(event) => handleSectionClick(event, item.href)}
                  ref={(node) => {
                    if (item.href.includes("#")) {
                      navLinkRefs.current[item.href.slice(item.href.indexOf("#"))] = node;
                    }
                  }}
                  className={`poster-link transition hover:text-red-200 ${isActive(item.href) ? "is-active" : ""}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="hidden shrink-0 items-center gap-2 lg:flex">
              <LumaCheckoutLink
                className="button-shift header-cta header-cta--tickets"
              >
                Get Tickets
              </LumaCheckoutLink>
              <Link
                href={FILMFREEWAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="button-shift header-cta header-cta--submit"
              >
                Submit Film
              </Link>
              <Link
                href={ORIGINALS_APPLICATION_URL}
                className="button-shift header-cta header-cta--pitch"
              >
                Submit Pitch
              </Link>
            </div>
          </div>
          ) : null}
        </div>
        <div
          id="mobile-menu"
          className={`mobile-header-menu lg:hidden ${isMobileMenuOpen ? "is-open" : ""}`}
          aria-label="Section navigation"
          onClick={handleMobileMenuClick}
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
          <div className="mobile-menu-cta">
            <div className="mobile-menu-buttons">
              <Link
                href={FILMFREEWAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mobile-menu-button mobile-menu-button--submit"
              >
                Submit Film
              </Link>
              <Link
                href={ORIGINALS_APPLICATION_URL}
                onClick={() => setIsMobileMenuOpen(false)}
                className="mobile-menu-button mobile-menu-button--pitch"
              >
                Submit Pitch
              </Link>
              <LumaCheckoutLink
                onClick={() => setIsMobileMenuOpen(false)}
                className="mobile-menu-button mobile-menu-button--tickets"
              >
                Get Tickets
              </LumaCheckoutLink>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
