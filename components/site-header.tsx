"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties, MouseEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { ClippedLoopVideo } from "./clipped-loop-video";
import { LumaCheckoutLink } from "./luma-checkout-link";

const LOGO_SRC = "/images/official-tfs-logo.png";
const COWBOY_SRC = "/images/header-cowboy.png";
const FILMFREEWAY_URL = "https://filmfreeway.com/TheFilmShow";
const NEWS_URL = "/news";
const ORIGINALS_APPLICATION_URL = "/originals#application";
const SHOW_FILMSHOW_GRANT = false;

type NavItem = {
  href: string;
  label: string;
  external?: boolean;
  sectionId?: string;
};

const navItems: NavItem[] = [
  { href: "/#what-is-this", label: "Experience" },
  { href: "/#photos", label: "Photos" },
  { href: "/#submit", label: "Submit" },
  ...(SHOW_FILMSHOW_GRANT ? [{ href: "/originals", label: "Grant" }] : []),
  { href: "/#why-submit", label: "Why?" },
  { href: "/team", label: "Team", sectionId: "team" },
  { href: NEWS_URL, label: "News" },
];

const mobileNavItems: NavItem[] = [
  { href: "/#what-is-this", label: "Experience" },
  { href: "/#photos", label: "Photos" },
  ...(SHOW_FILMSHOW_GRANT ? [{ href: "/originals", label: "Originals" }] : []),
  { href: "/#submit", label: "Submit" },
  { href: "/#why-submit", label: "Why" },
  { href: "/team", label: "Team", sectionId: "team" },
  { href: NEWS_URL, label: "News" },
];

const getIndicatorSrc = () =>
  typeof window !== "undefined" && window.location.protocol === "file:"
    ? "./images/header-cowboy.png"
    : COWBOY_SRC;

const getHrefHash = (href: string) => (href.includes("#") ? href.slice(href.indexOf("#")) : "");

const getSectionHash = (item: Pick<NavItem, "href" | "sectionId">) =>
  item.sectionId ? `#${item.sectionId}` : getHrefHash(item.href);

const getNavRefKey = (item: Pick<NavItem, "href">) => getHrefHash(item.href) || item.href;

export function SiteHeader() {
  const pathname = usePathname();
  const [hasScrolled, setHasScrolled] = useState(false);
  const [showFullLogo, setShowFullLogo] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCowboyDancing, setIsCowboyDancing] = useState(false);
  const [renderDesktopChrome, setRenderDesktopChrome] = useState(true);
  const [indicatorAssetOk, setIndicatorAssetOk] = useState(false);
  const [indicatorSrc] = useState(getIndicatorSrc);
  const navTrackRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileMenuToggleRef = useRef<HTMLButtonElement>(null);
  const navLinkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const manualActiveUntilRef = useRef(0);
  const cowboyDanceTimeoutRef = useRef<number | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, visible: false });

  const activeSectionItem = navItems.find((item) => getSectionHash(item) === activeHash);
  const activeNavRefKey = activeSectionItem ? getNavRefKey(activeSectionItem) : pathname === "/" ? "" : pathname;

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

  const isActive = (item: NavItem) => {
    const sectionHash = getSectionHash(item);

    if (sectionHash) {
      return activeHash === sectionHash || item.href === pathname;
    }

    return item.href === pathname;
  };

  const triggerCowboyDance = (duration = 520) => {
    if (typeof window === "undefined") return;
    if (window.innerWidth >= 1024) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setIsCowboyDancing(true);

    if (cowboyDanceTimeoutRef.current) {
      window.clearTimeout(cowboyDanceTimeoutRef.current);
    }

    cowboyDanceTimeoutRef.current = window.setTimeout(() => {
      setIsCowboyDancing(false);
      cowboyDanceTimeoutRef.current = null;
    }, duration);
  };

  const closeMobileMenu = () => {
    if (isMobileMenuOpen) {
      triggerCowboyDance();
    }

    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    triggerCowboyDance();
    setIsMobileMenuOpen((open) => !open);
  };

  const handleSectionClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname !== "/") {
      closeMobileMenu();
      return;
    }

    const hashIndex = href.indexOf("#");
    if (hashIndex === -1) {
      closeMobileMenu();
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
    closeMobileMenu();
  };

  const handleTopClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const top = document.getElementById("top");
    if (!top) return;

    event.preventDefault();
    top.scrollIntoView({ behavior: "smooth", block: "start" });
    window.history.pushState(null, "", "#top");
    setActiveHash("");
    closeMobileMenu();
  };

  const handleMobileMenuClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      closeMobileMenu();
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

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const toggleButton = mobileMenuToggleRef.current;
    // eslint-disable-next-line react-hooks/immutability
    document.body.style.overflow = "hidden";
    // eslint-disable-next-line react-hooks/immutability
    document.documentElement.style.overflow = "hidden";

    const focusFirstItem = window.setTimeout(() => {
      const firstFocusable = mobileMenuRef.current?.querySelector<HTMLElement>(
        "button, a, input, select, textarea, [tabindex]:not([tabindex='-1'])",
      );
      firstFocusable?.focus();
    }, 80);

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

      triggerCowboyDance();
      setIsMobileMenuOpen(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        triggerCowboyDance();
        setIsMobileMenuOpen(false);
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusableItems = Array.from(
        mobileMenuRef.current?.querySelectorAll<HTMLElement>(
          "button, a, input, select, textarea, [tabindex]:not([tabindex='-1'])",
        ) ?? [],
      ).filter((item) => !item.hasAttribute("disabled") && item.getAttribute("aria-hidden") !== "true");

      if (!focusableItems.length) {
        return;
      }

      const firstItem = focusableItems[0];
      const lastItem = focusableItems[focusableItems.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === firstItem) {
        event.preventDefault();
        lastItem?.focus();
      } else if (!event.shiftKey && activeElement === lastItem) {
        event.preventDefault();
        firstItem?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePagePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);

    return () => {
      window.clearTimeout(focusFirstItem);
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.removeEventListener("pointerdown", handlePagePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
      toggleButton?.focus();
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
        .map((item) => {
          const hash = getSectionHash(item);
          if (!hash) return null;

          const id = hash.slice(1);
          const el = document.getElementById(id);
          if (!el) return null;

          return {
            hash,
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

      if (window.innerWidth < 1024 && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setIsCowboyDancing(true);

        if (cowboyDanceTimeoutRef.current) {
          window.clearTimeout(cowboyDanceTimeoutRef.current);
        }

        cowboyDanceTimeoutRef.current = window.setTimeout(() => {
          setIsCowboyDancing(false);
          cowboyDanceTimeoutRef.current = null;
        }, 220);
      }
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
      if (cowboyDanceTimeoutRef.current) {
        window.clearTimeout(cowboyDanceTimeoutRef.current);
      }
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", updateHash);
    };
  }, [pathname]);

  useEffect(() => {
    const track = navTrackRef.current;
    const link = activeNavRefKey ? navLinkRefs.current[activeNavRefKey] : null;

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
  }, [activeNavRefKey]);

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
              className={`mobile-header-cowboy-link ${isCowboyDancing ? "is-dancing" : ""}`}
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
              ref={mobileMenuToggleRef}
              type="button"
              className="mobile-menu-toggle"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              onClick={toggleMobileMenu}
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
                    key={activeNavRefKey}
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
                    target={item.external ? "_blank" : undefined}
                    rel={item.external ? "noopener noreferrer" : undefined}
                    onClick={(event) => handleSectionClick(event, item.href)}
                    ref={(node) => {
                      navLinkRefs.current[getNavRefKey(item)] = node;
                    }}
                    className={`poster-link transition hover:text-red-200 ${isActive(item) ? "is-active" : ""}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              <div className="hidden shrink-0 items-center gap-2 lg:flex">
                <LumaCheckoutLink className="button-shift header-cta header-cta--tickets">
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
                {SHOW_FILMSHOW_GRANT ? (
                  <Link
                    href={ORIGINALS_APPLICATION_URL}
                    className="button-shift header-cta header-cta--pitch"
                  >
                    Submit Pitch
                  </Link>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
        <div
          id="mobile-menu"
          ref={mobileMenuRef}
          className={`mobile-header-menu lg:hidden ${isMobileMenuOpen ? "is-open" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label="Filmshow navigation"
          aria-hidden={!isMobileMenuOpen}
          onClick={handleMobileMenuClick}
        >
          <ClippedLoopVideo
            src="/videos/about-filmshow-background.mov"
            className="mobile-menu-background-video"
            startTime={6}
            endTime={20}
          />
          <div className="mobile-menu-panel" onClick={(event) => event.stopPropagation()}>
            <div className="mobile-menu-topline">
              <Link
                href="/#top"
                data-scroll-top
                onClick={handleTopClick}
                className="mobile-menu-logo-link"
                aria-label="Scroll to the top of Filmshow home page"
              >
                <Image
                  src={LOGO_SRC}
                  alt="Filmshow"
                  width={3400}
                  height={1362}
                  priority
                  unoptimized
                  className="mobile-menu-logo"
                />
              </Link>
              <Link
                href="/#top"
                data-scroll-top
                onClick={handleTopClick}
                className={`mobile-menu-cowboy-link ${isCowboyDancing ? "is-dancing" : ""}`}
                aria-label="Scroll to the top of Filmshow home page"
              >
                <Image
                  src={COWBOY_SRC}
                  alt=""
                  width={620}
                  height={820}
                  priority
                  unoptimized
                  aria-hidden="true"
                  className="mobile-menu-cowboy"
                />
              </Link>
              <button
                type="button"
                className="mobile-menu-close"
                onClick={closeMobileMenu}
              >
                Close
              </button>
            </div>

            <div className="mobile-menu-actions">
              <LumaCheckoutLink
                onClick={closeMobileMenu}
                className="mobile-menu-button mobile-menu-button--tickets"
              >
                Get Tickets
              </LumaCheckoutLink>
              <Link
                href={FILMFREEWAY_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={closeMobileMenu}
                className="mobile-menu-button mobile-menu-button--submit"
              >
                Submit Film
              </Link>
            </div>

            <div className="mobile-menu-divider" aria-hidden="true" />

            <div className="mobile-menu-program" aria-label="Mobile navigation">
              {mobileNavItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  target={item.external ? "_blank" : undefined}
                  rel={item.external ? "noopener noreferrer" : undefined}
                  onClick={(event) => handleSectionClick(event, item.href)}
                  className={`mobile-menu-link ${isActive(item) ? "is-active" : ""}`}
                  style={{ "--menu-item-delay": `${(index + 2) * 48}ms` } as CSSProperties}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
