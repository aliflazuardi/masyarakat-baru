import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { DISCLAIMER } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tentang",
  description: "Tentang prototipe Masyarakat Baru dan pembuatnya.",
};

// Phase 0 placeholder. Full about, data sources and contact land in Phase 4.
export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Tentang prototipe ini</h1>
      <Card className="mt-6">
        <p className="text-muted">
          Masyarakat Baru adalah prototipe konsep &ldquo;Malaka Interactive Suite&rdquo;: tiga alat
          web ringan yang memperluas seri-seri Malaka Project menjadi pengalaman interaktif.
        </p>
        <p className="mt-4 text-sm italic text-muted">{DISCLAIMER}</p>
      </Card>
    </div>
  );
}
