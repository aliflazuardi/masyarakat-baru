import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = {
  title: "Kalkulator Bahasa Bayi",
  description: "Membuat makroekonomi jadi mikro-personal.",
};

export default function CalculatorPage() {
  return (
    <ComingSoon
      title="Kalkulator Bahasa Bayi"
      tagline="Membuat makroekonomi jadi mikro-personal."
      accent="teal"
      eyebrow="Segera hadir · Fase 2"
    />
  );
}
