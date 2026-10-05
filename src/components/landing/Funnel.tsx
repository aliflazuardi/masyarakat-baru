import type { Pitch } from "@/content/schema";

// Full class names so Tailwind can detect them. Widths narrow stage by stage.
const STAGES = [
  { bar: "w-full bg-muted/40", text: "text-text" },
  { bar: "w-2/3 bg-teal/60", text: "text-teal" },
  { bar: "w-1/3 bg-gold", text: "text-gold" },
] as const;

/** Consumption-to-action funnel: narrowing bars with the KPI measured at each stage. */
export function Funnel({ stages }: { stages: Pitch["funnel"] }) {
  return (
    <ol className="space-y-5">
      {stages.map((s, i) => (
        <li key={s.stage}>
          <div aria-hidden className={`h-2 rounded-full ${STAGES[i].bar}`} />
          <p className={`mt-2 font-semibold ${STAGES[i].text}`}>
            {i + 1}. {s.stage}
          </p>
          <p className="text-sm text-muted">{s.detail}</p>
          {s.kpi && <p className="mt-1 text-xs text-gold">KPI: {s.kpi}</p>}
        </li>
      ))}
    </ol>
  );
}
