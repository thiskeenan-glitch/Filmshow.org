import type { Metadata } from "next";
import type { ReactNode } from "react";
import { V2Footer } from "@/components/v2/v2-footer";
import { V2Header } from "@/components/v2/v2-header";
import { MotionEffects } from "@/components/motion-effects";
import "./v2.css";

export const metadata: Metadata = {
  title: { default: "Filmshow — Short Films and Live Theater", template: "%s — Filmshow" },
  description: "Filmshow is a twice-yearly Brooklyn event combining short films and live theater.",
  robots: { index: false, follow: false },
};

export default function V2Layout({ children }: { children: ReactNode }) {
  return (
    <div className="v2-site">
      <MotionEffects />
      <V2Header />
      {children}
      <V2Footer />
    </div>
  );
}
