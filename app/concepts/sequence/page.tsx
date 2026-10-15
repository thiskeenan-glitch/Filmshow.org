import type { Metadata } from "next";
import { SequenceExperience } from "@/components/concepts/sequence-experience";

export const metadata: Metadata = {
  title: "Filmshow — Short Films and Live Theater",
  description: "Filmshow combines short films and live theater in Brooklyn.",
};

export default function SequenceConceptPage() {
  return <SequenceExperience />;
}
