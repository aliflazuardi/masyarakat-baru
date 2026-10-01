import type { Metadata } from "next";
import { KamusBrowser } from "@/components/kamus/KamusBrowser";
import { getFallacies } from "@/lib/content";

const title = "Kamus Sesat Pikir";
const description =
  "Contekan untuk debat di kolom komentar: kenali sesat pikir dan cara menanggapinya.";

export const metadata: Metadata = { title, description, openGraph: { title, description } };

export default function KamusPage() {
  const fallacies = getFallacies();
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-gold">
        The Court · Sabda PS
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-2 max-w-2xl text-muted">{description}</p>
      <div className="mt-6">
        <KamusBrowser fallacies={fallacies} />
      </div>
    </div>
  );
}
