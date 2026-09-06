import { MotionEffects } from "@/components/motion-effects";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { FilmmakerMaterialsFormV2 } from "./filmmaker-materials-form-v2";

export const metadata: Metadata = {
  title: "Filmmaker Materials | Filmshow",
  description: "Private materials form for filmmakers selected for Filmshow Vol. 1.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
  },
};

function SelectionLaurel() {
  return (
    <div
      aria-label="Filmshow official selection, Vol. 1, one of five"
      data-reveal="text"
      style={{
        width: "min(100%, 68rem)",
        margin: "clamp(4.5rem, 8vw, 7rem) auto 0",
      }}
    >
      <svg
        viewBox="0 0 1200 520"
        role="img"
        aria-labelledby="filmshow-selection-title filmshow-selection-desc"
        style={{ display: "block", width: "100%", height: "auto" }}
      >
        <title id="filmshow-selection-title">Filmshow Official Selection — Vol. 1</title>
        <desc id="filmshow-selection-desc">One of five films selected for Filmshow Vol. 1.</desc>

        <defs>
          <filter id="selection-soft-rough" x="-8%" y="-8%" width="116%" height="116%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.022"
              numOctaves="2"
              seed="11"
              result="noise"
            />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.9" />
          </filter>
        </defs>

        <g
          fill="none"
          stroke="#f8f4eb"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.98"
        >
          <path d="M 322 82 Q 208 260 322 438" />
          <path d="M 878 82 Q 992 260 878 438" />
        </g>

        <g fill="#f8f4eb" opacity="0.98">
          <circle cx="282" cy="90" r="9" />
          <circle cx="254" cy="116" r="11" />
          <circle cx="232" cy="149" r="13" />
          <circle cx="217" cy="187" r="15" />
          <circle cx="208" cy="228" r="13" />
          <circle cx="205" cy="269" r="11" />
          <circle cx="211" cy="308" r="14" />
          <circle cx="224" cy="345" r="12" />
          <circle cx="243" cy="379" r="10" />
          <circle cx="267" cy="408" r="8" />
          <circle cx="306" cy="126" r="7" />
          <circle cx="287" cy="163" r="9" />
          <circle cx="275" cy="204" r="8" />
          <circle cx="270" cy="246" r="7" />
          <circle cx="274" cy="289" r="8" />
          <circle cx="285" cy="330" r="7" />
          <circle cx="302" cy="368" r="6" />

          <circle cx="918" cy="90" r="9" />
          <circle cx="946" cy="116" r="11" />
          <circle cx="968" cy="149" r="13" />
          <circle cx="983" cy="187" r="15" />
          <circle cx="992" cy="228" r="13" />
          <circle cx="995" cy="269" r="11" />
          <circle cx="989" cy="308" r="14" />
          <circle cx="976" cy="345" r="12" />
          <circle cx="957" cy="379" r="10" />
          <circle cx="933" cy="408" r="8" />
          <circle cx="894" cy="126" r="7" />
          <circle cx="913" cy="163" r="9" />
          <circle cx="925" cy="204" r="8" />
          <circle cx="930" cy="246" r="7" />
          <circle cx="926" cy="289" r="8" />
          <circle cx="915" cy="330" r="7" />
          <circle cx="898" cy="368" r="6" />
        </g>

        <g
          fill="#f8f4eb"
          textAnchor="middle"
          fontFamily='"Avenir Next Condensed", "Helvetica Neue", Arial, sans-serif'
          filter="url(#selection-soft-rough)"
        >
          <text x="600" y="105" fontSize="27" fontWeight="800" letterSpacing="15">
            1 OF 5
          </text>
          <text x="600" y="270" fontSize="102" fontWeight="900" letterSpacing="4">
            FILMSHOW
          </text>
          <text x="600" y="351" fontSize="32" fontWeight="800" letterSpacing="10">
            OFFICIAL SELECTION
          </text>
          <text x="600" y="414" fontSize="29" fontWeight="700" letterSpacing="11">
            VOL. 1
          </text>
        </g>

        <circle cx="414" cy="166" r="11" fill="#ff2b22" />
      </svg>
    </div>
  );
}

export default function FilmmakersPage() {
  return (
    <main id="top" className="filmmakers-page">
      <MotionEffects />
      <section className="filmmakers-intro">
        <div className="filmmakers-container">
          <Link
            href="/"
            className="filmmakers-brand"
            aria-label="Go to the Filmshow homepage"
            data-reveal="text"
          >
            <span className="filmmakers-brand-crop">
              <Image
                src="/images/official-tfs-logo.png"
                alt=""
                width={8247}
                height={1889}
                priority
                unoptimized
              />
            </span>
          </Link>

          <SelectionLaurel />

          <div className="filmmakers-intro-copy" data-reveal="text">
            <p className="filmmakers-private-label">Private filmmaker line</p>
            <h1>
              You&apos;re <em>in.</em>
            </h1>
            <p>We need a few things before October 3.</p>
          </div>
          <div className="filmmakers-event-line" data-reveal="line">
            <span>Filmshow Vol. 1</span>
            <span>10.03.26</span>
            <span>Rollin Studios · Brooklyn</span>
          </div>
        </div>
      </section>

      <FilmmakerMaterialsFormV2 />
    </main>
  );
}
