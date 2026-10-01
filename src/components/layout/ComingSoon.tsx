import type { Accent } from "@/lib/site";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { accentText } from "@/components/ui/accent";

type ComingSoonProps = {
  title: string;
  tagline: string;
  accent?: Accent;
  /** Small label above the title. */
  eyebrow: string;
};

/** Placeholder for routes whose feature lands in a later phase. */
export function ComingSoon({ title, tagline, accent, eyebrow }: ComingSoonProps) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <Card accent={accent}>
        <p
          className={`text-xs font-semibold uppercase tracking-widest ${accent ? accentText[accent] : "text-muted"}`}
        >
          {eyebrow}
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-muted">{tagline}</p>
        <div className="mt-6">
          <ButtonLink href="/" variant="ghost">
            Kembali ke beranda
          </ButtonLink>
        </div>
      </Card>
    </div>
  );
}
