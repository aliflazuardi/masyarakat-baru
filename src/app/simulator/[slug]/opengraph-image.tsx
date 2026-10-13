import { getScenario, getScenarios } from "@/lib/content";
import { ogContentType, ogSize, renderOg } from "@/lib/og";

export const alt = "Skenario Simulator Dampak Sosial";
export const size = ogSize;
export const contentType = ogContentType;
export const dynamic = "force-static";

export function generateStaticParams() {
  return getScenarios().map((s) => ({ slug: s.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = getScenario(slug);
  return renderOg({
    eyebrow: `Simulator · Peran: ${s?.perspective ?? ""}`,
    title: s?.title ?? "Simulator Dampak Sosial",
    subtitle: s?.tagline ?? "",
    accent: "pink",
  });
}
