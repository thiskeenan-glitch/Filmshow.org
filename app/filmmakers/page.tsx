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
