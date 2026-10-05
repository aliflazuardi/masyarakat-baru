import Link from "next/link";
import { Funnel } from "@/components/landing/Funnel";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { accentText } from "@/components/ui/accent";
import { getPitch } from "@/lib/content";
import { SITE_TAGLINE, TOOLS } from "@/lib/site";

const idNumber = new Intl.NumberFormat("id-ID");

function SectionTitle({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="text-2xl font-bold tracking-tight sm:text-3xl">
      {children}
    </h2>
  );
}

export default function HomePage() {
  const pitch = getPitch();
  const audience = idNumber.format(pitch.audience.value);

  return (
    <div className="mx-auto max-w-5xl space-y-20 px-4 pb-8">
      <section className="pt-16 sm:pt-24">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold">
          Malaka Interactive Suite · Prototipe
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">{SITE_TAGLINE}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Tiga alat interaktif untuk memahami kebijakan, berpikir lebih jernih, dan merasakan dampak
          isu sosial, bukan sekadar menontonnya.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="#alat">Coba sekarang</ButtonLink>
          <ButtonLink href="#batas-tombol-play" variant="ghost">
            Mengapa ini penting
          </ButtonLink>
        </div>
      </section>

      <section id="alat" aria-labelledby="alat-judul" className="-mt-8 scroll-mt-20">
        <h2 id="alat-judul" className="sr-only">
          Tiga alat
        </h2>
        <ul className="grid gap-4 sm:grid-cols-3">
          {TOOLS.map((tool) => (
            <li key={tool.href}>
              <Link href={tool.href} className="block h-full rounded-2xl">
                <Card
                  accent={tool.accent}
                  className="h-full transition-colors hover:bg-surface-strong"
                >
                  <p className={`text-xs font-semibold ${accentText[tool.accent]}`}>
                    {tool.series}
                  </p>
                  <h3 className="mt-2 text-xl font-bold">{tool.title}</h3>
                  <p className="mt-2 text-sm text-muted">{tool.tagline}</p>
                  <p className={`mt-4 text-sm font-semibold ${accentText[tool.accent]}`}>
                    Coba sekarang →
                  </p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="batas-tombol-play" aria-labelledby="batas-judul" className="scroll-mt-20">
        <SectionTitle id="batas-judul">Batas Tombol Play</SectionTitle>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">Hari ini</p>
            <p className="mt-2 font-mono text-4xl font-bold tabular-nums">{audience}+</p>
            <p className="mt-1 text-sm text-muted">
              {pitch.audience.label}. Mereka menonton, mendengarkan, lalu kembali ke hari
              masing-masing.
            </p>
            <p className="mt-3 text-xs text-muted">Sumber: {pitch.audience.source}</p>
          </Card>
          <Card accent="gold">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold">Berikutnya</p>
            <p className="mt-2 text-2xl font-bold">Dari menonton ke berlatih</p>
            <p className="mt-1 text-sm text-muted">
              Ide-ide yang diajarkan Malaka bisa dicoba langsung: menghitung dampak kebijakan,
              mengenali sesat pikir, dan merasakan pilihan sulit warga.
            </p>
          </Card>
        </div>
      </section>

      <section aria-labelledby="matriks-judul">
        <SectionTitle id="matriks-judul">Matriks Aktivasi</SectionTitle>
        <p className="mt-2 max-w-2xl text-muted">
          Setiap alat melayani satu kelompok penonton dan melatih satu kemampuan.
        </p>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wider text-muted">
              <tr>
                <th scope="col" className="px-4 py-3">
                  Alat
                </th>
                <th scope="col" className="px-4 py-3">
                  Tujuan
                </th>
                <th scope="col" className="px-4 py-3">
                  Segmen
                </th>
                <th scope="col" className="px-4 py-3">
                  Seri terkait
                </th>
                <th scope="col" className="px-4 py-3">
                  Kemampuan
                </th>
              </tr>
            </thead>
            <tbody>
              {pitch.matrix.map((row, i) => {
                const tool = TOOLS[i];
                return (
                  <tr key={row.tool} className="border-t border-border">
                    <th
                      scope="row"
                      className={`px-4 py-3 font-semibold ${accentText[tool.accent]}`}
                    >
                      <Link href={tool.href} className="hover:underline">
                        {tool.title}
                      </Link>
                    </th>
                    <td className="px-4 py-3">{row.intent}</td>
                    <td className="px-4 py-3">{row.segment}</td>
                    <td className="px-4 py-3 text-muted">{tool.series}</td>
                    <td className="px-4 py-3">{row.skill}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="corong-judul">
        <SectionTitle id="corong-judul">Dari Menonton ke Bertindak</SectionTitle>
        <div className="mt-6 max-w-xl">
          <Funnel stages={pitch.funnel} />
        </div>
      </section>

      <section aria-labelledby="peta-judul">
        <SectionTitle id="peta-judul">Peta Jalan Enam Bulan</SectionTitle>
        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {pitch.roadmap.map((step) => (
            <li key={step.phase}>
              <Card className="h-full">
                <p className="font-mono text-xs text-gold">
                  {step.phase} · {step.months}
                </p>
                <h3 className="mt-2 text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm text-muted">{step.detail}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="arsitektur-judul">
        <SectionTitle id="arsitektur-judul">Arsitektur</SectionTitle>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {pitch.architecture.map((a) => (
            <li key={a.layer}>
              <Card className="h-full">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                  {a.layer}
                </p>
                <h3 className="mt-2 text-lg font-bold">{a.name}</h3>
                <p className="mt-2 text-sm text-muted">{a.detail}</p>
              </Card>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted">
          Prototipe ini sudah berjalan di atas tumpukan teknologi tersebut.
        </p>
      </section>

      <section aria-labelledby="ngobrol-judul">
        <Card accent="gold">
          <h2 id="ngobrol-judul" className="text-2xl font-bold tracking-tight">
            Mari ngobrol
          </h2>
          <p className="mt-2 max-w-2xl text-muted">{pitch.about.bio}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={pitch.about.githubUrl}
              className="inline-flex min-h-11 items-center rounded-xl bg-gold px-5 text-sm font-semibold text-bg hover:bg-gold/85"
            >
              Mari ngobrol di GitHub
            </a>
            <ButtonLink href="/tentang/" variant="ghost">
              Tentang pembuatnya
            </ButtonLink>
          </div>
        </Card>
      </section>
    </div>
  );
}
