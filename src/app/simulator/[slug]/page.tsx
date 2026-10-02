import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScenarioPlayer } from "@/components/simulator/ScenarioPlayer";
import { getScenario, getScenarios } from "@/lib/content";

export const dynamicParams = false;

export function generateStaticParams() {
  return getScenarios().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/simulator/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const s = getScenario(slug);
  if (!s) return {};
  return {
    title: s.title,
    description: s.tagline,
    openGraph: { title: s.title, description: s.tagline },
  };
}

export default async function ScenarioPage({ params }: PageProps<"/simulator/[slug]">) {
  const { slug } = await params;
  const scenario = getScenario(slug);
  if (!scenario) notFound();
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/simulator/" className="text-sm text-muted hover:text-text">
        ← Semua skenario
      </Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{scenario.title}</h1>
      <p className="mt-2 text-muted">{scenario.tagline}</p>
      <div className="mt-6">
        <ScenarioPlayer scenario={scenario} />
      </div>
    </div>
  );
}
