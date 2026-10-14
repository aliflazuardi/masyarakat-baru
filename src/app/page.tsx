import Link from "next/link";
import type { ReactNode } from "react";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { accentBg, accentText } from "@/components/ui/accent";
import { getPitch, getProfile } from "@/lib/content";
import { SITE_TAGLINE, TOOLS } from "@/lib/site";

// The proposal itself (BUILD_PLAN.md §7.1): the page the cold email links to.
export default function HomePage() {
  const pitch = getPitch();
  const profile = getProfile();
  const audience = `${(pitch.audience.value / 1e6).toLocaleString("id-ID", { maximumFractionDigits: 2 })} juta+`;

  return (
    <div className="mx-auto max-w-5xl px-4">
      {/* 1. Hero */}
      <section className="pt-12 pb-8 sm:pt-20 sm:pb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-gold">
          Malaka Interactive Suite · Prototipe proposal
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-6xl">{SITE_TAGLINE}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">
          Tiga alat web ringan yang mengubah seri-seri Malaka dari tontonan menjadi latihan:
          memahami kebijakan, berpikir lebih jernih, dan merasakan dampak isu sosial.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="#alat">Coba sekarang</ButtonLink>
          <ButtonLink href="#kontak" variant="ghost">
            Mari ngobrol
          </ButtonLink>
        </div>
      </section>

      {/* 2. The limit of the play button */}
      <Section id="tombol-play" eyebrow="Masalahnya" title="Batas tombol play">
        <div className="grid gap-3 sm:grid-cols-2">
          <Card>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted">
              Konsumsi pasif
            </p>
            <p className="num mt-2 text-3xl font-bold" data-testid="audience">
              {audience}
            </p>
            <p className="text-sm text-muted">
              {pitch.audience.label} menonton, mendengar, dan belajar.
            </p>
          </Card>
          <Card accent="gold">
            <p className="text-xs font-semibold uppercase tracking-widest text-gold">
              Partisipasi aktif
            </p>
            <p className="mt-2 text-3xl font-bold">Masyarakat Baru</p>
            <p className="text-sm text-muted">
              Penonton yang menghitung, menguji argumen, dan bertindak.
            </p>
          </Card>
        </div>
        <p className="mt-4 max-w-3xl text-muted">
          Malaka sudah membangun audiens besar. Tapi masyarakat yang cerdas, kritis, dan empatik
          butuh lebih dari video: mereka butuh tempat untuk <em>mempraktikkan</em> apa yang mereka
          pelajari.
        </p>
      </Section>

      {/* 3. Tools */}
      <Section id="alat" eyebrow="Solusinya" title="Tiga alat, sudah bisa dicoba">
        <ul className="grid gap-4 sm:grid-cols-3">
          {TOOLS.map((tool) => (
            <li key={tool.href}>
              <Link prefetch={false} href={tool.href} className="block h-full rounded-2xl">
                <Card
                  accent={tool.accent}
                  className="h-full transition-colors hover:bg-surface-strong"
                >
                  <p className={`text-xs font-semibold ${accentText[tool.accent]}`}>
                    {tool.series}
                  </p>
                  <h3 className="mt-2 text-xl font-bold">{tool.title}</h3>
                  <p className="mt-2 text-sm text-muted">{tool.tagline}</p>
                  <p className={`mt-4 text-sm font-semibold ${accentText[tool.accent]}`}>Coba →</p>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted">
          Plus{" "}
          <Link
            prefetch={false}
            href="/kamus-sesat-pikir/"
            className="text-gold underline-offset-4 hover:underline"
          >
            Kamus Sesat Pikir
          </Link>
          , contekan yang bisa dicari untuk debat di kolom komentar.
        </p>
      </Section>

      {/* 4. Activation matrix */}
      <Section id="matriks" eyebrow="Strategi" title="Matriks aktivasi ekosistem Malaka">
        <div className="overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="bg-surface text-xs text-muted">
              <tr>
                {["Alat", "Tujuan", "Segmen", "Seri terkait", "Keterampilan"].map((h) => (
                  <th key={h} scope="col" className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pitch.matrix.map((r) => (
                <tr key={r.tool} className="border-t border-border">
                  <th scope="row" className="px-4 py-3 font-semibold">
                    <span className="flex items-center gap-2">
                      <span aria-hidden className={`h-4 w-1 rounded-full ${accentBg[r.accent]}`} />
                      <Link prefetch={false} href={r.href} className="hover:underline">
                        {r.tool}
                      </Link>
                    </span>
                  </th>
                  <td className="px-4 py-3">{r.intent}</td>
                  <td className="px-4 py-3">{r.segment}</td>
                  <td className="px-4 py-3">{r.series}</td>
                  <td className="px-4 py-3">{r.skill}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* 5. Funnel */}
      <Section id="corong" eyebrow="Dampak" title="Dari menonton ke bertindak">
        <div className="grid gap-4 lg:grid-cols-[3fr_2fr]">
          <Card>
            <figure>
              <Funnel />
              <figcaption className="mt-2 text-xs text-muted">
                Ilustrasi konsep: keterlibatan YouTube mendatar di tontonan, suka, dan subscribe;
                alat interaktif membawanya ke menghitung, menyimulasikan, lalu bertindak.
              </figcaption>
            </figure>
          </Card>
          <Card accent="gold">
            <h3 className="font-semibold">Yang diukur: tindakan, bukan tontonan</h3>
            <ul className="mt-4 grid gap-4">
              {pitch.kpis.map((k) => (
                <li key={k.name}>
                  <p className="font-semibold">{k.name}</p>
                  <p className="text-sm text-muted">{k.measure}</p>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-muted">
              Prototipe ini sudah mengirim event analitik untuk ketiganya, tanpa cookie dan tanpa
              data pribadi.
            </p>
          </Card>
        </div>
      </Section>

      {/* 6. Roadmap */}
      <Section id="peta-jalan" eyebrow="Rencana" title="Peta jalan enam bulan">
        <ol className="grid gap-4 sm:grid-cols-3">
          {pitch.roadmap.map((r, i) => (
            <li key={r.tool}>
              <Card accent={r.accent} className="h-full">
                <p className="text-xs text-muted">
                  Fase {i + 1} · {r.months}
                </p>
                <h3 className={`mt-2 text-lg font-bold ${accentText[r.accent]}`}>{r.tool}</h3>
                <p className="mt-2 text-sm text-muted">{r.why}</p>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      {/* 7. Architecture */}
      <Section
        id="arsitektur"
        eyebrow="Teknologi"
        title="Dirancang untuk jutaan pengguna, tanpa beban berlebih"
      >
        <p className="mb-4 max-w-3xl text-muted">
          Prototipe ini sudah berjalan di atas fondasi yang sama dengan versi produksinya. Yang
          berubah hanya sumber konten dan tempat hosting.
        </p>
        <ul className="grid gap-3 sm:grid-cols-3">
          {pitch.architecture.map((a) => (
            <li key={a.layer}>
              <Card className="h-full">
                <h3 className="font-semibold">{a.layer}</h3>
                <p className="mt-3 text-xs uppercase tracking-widest text-muted">Sekarang</p>
                <p className="text-sm">{a.now}</p>
                <p className="mt-3 text-xs uppercase tracking-widest text-muted">Produksi</p>
                <p className="text-sm">{a.production}</p>
              </Card>
            </li>
          ))}
        </ul>
      </Section>

      {/* 8. About + CTA */}
      <Section id="kontak" eyebrow="Pembuat" title="Mari ngobrol">
        <Card accent="gold">
          <p className="text-xl font-bold">{profile.name}</p>
          <p className="text-sm text-muted">{profile.role}</p>
          <p className="mt-3 max-w-2xl">{profile.bio}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`mailto:${profile.email}?subject=${encodeURIComponent("Malaka Interactive Suite")}`}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gold px-5 text-sm font-semibold text-bg hover:bg-gold/85"
            >
              Kirim email
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-5 text-sm font-semibold hover:bg-surface-strong"
            >
              GitHub
            </a>
            {profile.linkedin && (
              <a
                href={profile.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border px-5 text-sm font-semibold hover:bg-surface-strong"
              >
                LinkedIn
              </a>
            )}
          </div>
        </Card>
      </Section>
    </div>
  );
}

function Section({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-judul`} className="scroll-mt-20 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted">{eyebrow}</p>
      <h2 id={`${id}-judul`} className="mt-2 mb-6 text-2xl font-bold tracking-tight sm:text-3xl">
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Conceptual curve (not data): YouTube engagement plateaus, interactive tools climb to action. */
function Funnel() {
  return (
    <svg
      viewBox="0 0 400 220"
      className="h-auto w-full"
      role="img"
      aria-labelledby="corong-svg-judul"
    >
      <title id="corong-svg-judul">
        Kurva ilustrasi: dampak YouTube mendatar, alat interaktif naik hingga aksi sipil
      </title>
      <g stroke="var(--border)" strokeWidth="1">
        <line x1="40" y1="190" x2="390" y2="190" />
        <line x1="40" y1="190" x2="40" y2="15" />
      </g>
      <path
        d="M40 188 C 110 150, 160 128, 220 124 L 380 124"
        fill="none"
        stroke="var(--text-muted)"
        strokeWidth="2"
        strokeDasharray="3 5"
      />
      <path
        d="M220 124 C 300 122, 345 90, 372 30"
        fill="none"
        stroke="var(--accent-gold)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <circle cx="372" cy="30" r="7" fill="var(--accent-gold)" stroke="var(--bg)" strokeWidth="2" />
      <g fontSize="13" fill="var(--text)" fontFamily="inherit">
        <text x="364" y="18" textAnchor="end" fontWeight="700">
          Aksi sipil
        </text>
        <text x="296" y="74" textAnchor="end">
          Hitung → Simulasi → Bertindak
        </text>
        <text x="380" y="144" textAnchor="end" fill="var(--text-muted)">
          Tonton → Suka → Subscribe
        </text>
      </g>
      <g fontSize="12" fill="var(--text-muted)" fontFamily="inherit">
        <text x="215" y="207" textAnchor="middle">
          Kedalaman keterlibatan
        </text>
        <text x="16" y="105" textAnchor="middle" transform="rotate(-90 16 105)">
          Dampak
        </text>
      </g>
    </svg>
  );
}
