import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Simulator Dampak Sosial";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-static";

export default function Image() {
  return renderOg({
    eyebrow: "Dokumenter Investigasi",
    title: "Simulator Dampak Sosial",
    subtitle: "Dari kisah yang didengar, menjadi pengalaman yang dirasakan.",
    accent: "pink",
  });
}
