import type { Metadata } from "next";
import { ConceptNav } from "@/components/concepts/concept-nav";
import { SequenceExperience } from "@/components/concepts/sequence-experience";

export const metadata: Metadata = {
  title: "Film / Show Sequence — Filmshow Concept",
  description: "The alternating rhythm of Filmshow translated into an immersive scroll.",
};

export default function SequenceConceptPage() {
  return (
    <>
      <ConceptNav current="sequence" />
      <SequenceExperience />
    </>
  );
}
