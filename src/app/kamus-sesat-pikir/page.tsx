import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = {
  title: "Kamus Sesat Pikir",
  description: "Contekan untuk debat di kolom komentar.",
};

export default function KamusPage() {
  return (
    <ComingSoon
      title="Kamus Sesat Pikir"
      tagline="Contekan untuk debat di kolom komentar."
      accent="gold"
      eyebrow="Segera hadir · Fase 1"
    />
  );
}
