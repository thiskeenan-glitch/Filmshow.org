import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./concepts.css";

export const metadata: Metadata = {
  title: "Filmshow — Design Concepts",
  description:
    "Three experimental directions for the next Filmshow digital home.",
  robots: { index: false, follow: false },
};

export default function ConceptsLayout({ children }: { children: ReactNode }) {
  return <div className="fs-concept">{children}</div>;
}
