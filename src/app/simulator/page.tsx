import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { getScenarios } from "@/lib/content";

const title = "Simulator Dampak Sosial";
const description = "Dari kisah yang didengar, menjadi pengalaman yang dirasakan.";

export const metadata: Metadata = { title, description, openGraph: { title, description } };

export default function SimulatorPage() {
  const scenarios = getScenarios();
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-pink">
        Dokumenter Investigasi
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-2 text-muted">
        {description} Pilih peran, ambil keputusan, dan lihat siapa yang menanggung akibatnya.
      </p>
      <ul className="mt-8 grid gap-4">
        {scenarios.map((s) => (
          <li key={s.slug}>
            <Link href={`/simulator/${s.slug}/`} className="block rounded-2xl">
              <Card accent="pink" className="transition-colors hover:bg-surface-strong">
                <p className="text-xs font-semibold text-pink">Peran: {s.perspective}</p>
                <h2 className="mt-2 text-xl font-bold">{s.title}</h2>
                <p className="mt-2 text-sm text-muted">{s.tagline}</p>
                <p className="mt-3 text-xs text-muted">± 3–5 menit</p>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
