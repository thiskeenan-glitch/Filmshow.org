import type { Metadata } from "next";
import { ConceptNav } from "@/components/concepts/concept-nav";
import { DoorsExperience } from "@/components/concepts/doors-experience";

export const metadata: Metadata = {
  title: "The Two Doors — Filmshow Concept",
  description: "An architectural Film / Show entrance for Filmshow.",
};

export default function DoorsConceptPage() {
  return (
    <>
      <ConceptNav current="doors" />
      <DoorsExperience />
    </>
  );
}
