import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Kamus Sesat Pikir";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-static";

export default function Image() {
  return renderOg({
    eyebrow: "The Court · Sabda PS",
    title: "Kamus Sesat Pikir",
    subtitle: "Contekan untuk debat di kolom komentar.",
    accent: "gold",
  });
}
