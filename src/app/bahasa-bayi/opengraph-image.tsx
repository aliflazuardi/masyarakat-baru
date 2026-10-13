import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Kalkulator Bahasa Bayi";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-static";

export default function Image() {
  return renderOg({
    eyebrow: "Bahasa Bayi · APBN 2026",
    title: "Kalkulator Bahasa Bayi",
    subtitle: "Membuat makroekonomi jadi mikro-personal: APBN dalam rupiah per orang.",
    accent: "teal",
  });
}
