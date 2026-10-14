import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Dari penonton menjadi warga.";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-static";

export default function Image() {
  return renderOg({
    eyebrow: "Malaka Interactive Suite",
    title: "Dari penonton menjadi warga.",
    subtitle: "Kalkulator kebijakan, kuis sesat pikir harian, dan simulator dampak sosial.",
    accent: "gold",
  });
}
