import type { Metadata } from "next";
import { ConceptNav } from "@/components/concepts/concept-nav";
import { GlassExperience } from "@/components/concepts/glass-experience";

export const metadata: Metadata = {
  title: "The Glass Theater — Filmshow Concept",
  description: "A translucent Filmshow wordmark that separates, reveals, and reunites.",
};

export default function GlassConceptPage() {
  return (
    <>
      <ConceptNav current="glass" />
      <GlassExperience />
    </>
  );
}
