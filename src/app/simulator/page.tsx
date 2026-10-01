import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = {
  title: "Simulator Dampak Sosial",
  description: "Dari kisah yang didengar, menjadi pengalaman yang dirasakan.",
};

export default function SimulatorPage() {
  return (
    <ComingSoon
      title="Simulator Dampak Sosial"
      tagline="Dari kisah yang didengar, menjadi pengalaman yang dirasakan."
      accent="pink"
      eyebrow="Segera hadir · Fase 3"
    />
  );
}
