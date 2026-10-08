import type { Metadata } from "next";
import { SequenceExperience } from "@/components/concepts/sequence-experience";

export const metadata: Metadata = {
  title: "Filmshow — Short Film and Live Performance",
  description: "Filmshow combines short cinema and live performance in Brooklyn.",
};

export default function SequenceConceptPage() {
  return <SequenceExperience />;
}
