import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Tentang prototipe ini";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-static";

export default function Image() {
  return renderOg({
    eyebrow: "Tentang",
    title: "Tentang prototipe ini",
    subtitle: "Tujuan, sumber data, privasi, dan pembuatnya.",
    accent: "gold",
  });
}
