import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { accentText } from "@/components/ui/accent";
import { SITE_TAGLINE, TOOLS } from "@/lib/site";

// Phase 0 shell. The full proposal landing page (BUILD_PLAN.md §7.1) lands in Phase 4.
export default function HomePage() {
  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="py-16 sm:py-24">
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
          <ButtonLink href="/tentang/" variant="ghost">
            Tentang prototipe ini
          </ButtonLink>
        </div>
      </section>

      <section id="alat" aria-labelledby="alat-judul" className="scroll-mt-20">
        <h2 id="alat-judul" className="sr-only">
          Alat
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
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
