import { MotionEffects } from "@/components/motion-effects";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Materials Sent | Filmshow",
  description: "Your filmmaker materials were sent to Filmshow.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nocache: true,
  },
};

export default function FilmmakerMaterialsSentPage() {
  return (
    <main id="top" className="filmmakers-page">
      <MotionEffects />
      <section className="filmmakers-success" aria-labelledby="sent-title">
        <Link
          href="/"
          className="filmmakers-brand"
          aria-label="Go to the Filmshow homepage"
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
        <div className="filmmakers-container">
          <p className="filmmakers-private-label">Submission received</p>
          <h1 id="sent-title">
            It&apos;s <em>sent.</em>
          </h1>
          <p className="filmmakers-success-lede">We got everything.</p>
          <div className="filmmakers-success-details">
            <span>Filmshow Vol. 1</span>
            <span>Rollin Studios</span>
            <span>Brooklyn · October 3</span>
          </div>
        </div>
      </section>
    </main>
  );
}
