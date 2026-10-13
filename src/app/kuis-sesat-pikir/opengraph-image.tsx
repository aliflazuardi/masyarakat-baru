import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Kuis Sesat Pikir";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-static";

export default function Image() {
  return renderOg({
    eyebrow: "The Court · Sabda PS",
    title: "Kuis Sesat Pikir",
    subtitle: "30 detik sehari untuk berpikir lebih jernih.",
    accent: "gold",
  });
}
