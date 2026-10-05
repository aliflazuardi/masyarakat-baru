import type { Metadata } from "next";
import { Card } from "@/components/ui/Card";
import { getDataSources, getPitch } from "@/lib/content";
import { DISCLAIMER } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tentang",
  description: "Tentang prototipe Masyarakat Baru, pembuatnya, dan sumber datanya.",
};

export default function AboutPage() {
  const { about } = getPitch();
  const sources = getDataSources();

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight">Tentang prototipe ini</h1>

      <Card>
        <p className="text-muted">
          Masyarakat Baru adalah prototipe konsep &ldquo;Malaka Interactive Suite&rdquo;: tiga alat
          web ringan yang memperluas seri-seri Malaka Project menjadi pengalaman interaktif.
        </p>
        <p data-testid="about-disclaimer" className="mt-4 text-sm italic text-muted">
          {DISCLAIMER}
        </p>
      </Card>

      <Card>
        <h2 className="text-xl font-bold">Pembuat</h2>
        <p className="mt-2 font-semibold">{about.name}</p>
        <p className="mt-1 text-muted">{about.bio}</p>
        <ul className="mt-4 flex flex-wrap gap-4 text-sm">
          <li>
            <a href={about.githubUrl} className="text-gold underline underline-offset-4">
              GitHub
            </a>
          </li>
          <li>
            <a href={about.repoUrl} className="text-gold underline underline-offset-4">
              Kode sumber situs ini
            </a>
          </li>
        </ul>
      </Card>

      <Card>
        <h2 className="text-xl font-bold">Catatan tentang angka dan konten</h2>
        <ul className="mt-2 list-disc space-y-2 pl-5 text-muted">
          <li>
            Kalkulator adalah{" "}
            <strong className="text-text">simulasi edukatif, bukan proyeksi resmi</strong>. Rumus
            dan asumsinya dijelaskan di bagian &ldquo;Bagaimana kami menghitung?&rdquo;.
          </li>
          <li>
            Contoh sesat pikir dan soal kuis memakai pembicara generik, tidak menyebut tokoh
            sungguhan.
          </li>
          <li>
            Skenario simulator terinspirasi kisah nyata; nama dan detail telah disederhanakan.
            Peluang di dalamnya adalah perkiraan ilustratif.
          </li>
          <li>
            Tanpa cookie dan tanpa data pribadi. Kemajuan kuis disimpan hanya di peramban Anda.
          </li>
        </ul>
      </Card>

      <Card>
        <h2 className="text-xl font-bold">Sumber data kalkulator</h2>
        <ul className="mt-2 space-y-1 text-sm">
          {sources.map((s) => (
            <li key={s.label}>
              {s.url ? (
                <a href={s.url} className="text-teal underline underline-offset-4">
                  {s.label}
                </a>
              ) : (
                <span className="text-muted">{s.label}</span>
              )}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
