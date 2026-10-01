import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = {
  title: "Kuis Sesat Pikir",
  description: "30 detik sehari untuk berpikir lebih jernih.",
};

export default function QuizPage() {
  return (
    <ComingSoon
      title="Kuis Sesat Pikir"
      tagline="30 detik sehari untuk berpikir lebih jernih."
      accent="gold"
      eyebrow="Segera hadir · Fase 1"
    />
  );
}
