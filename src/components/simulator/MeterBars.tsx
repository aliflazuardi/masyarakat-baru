import type { Scenario } from "@/content/schema";
import type { Meters } from "@/lib/simulator/engine";

type Props = {
  scenario: Scenario;
  meters: Meters;
  /** Changes from the last step, shown as ▲/▼ badges. */
  deltas?: Meters;
};

/** One bar per meter, labelled with its value; changes carry an arrow and a sign, never colour alone. */
export function MeterBars({ scenario, meters, deltas = {} }: Props) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-3" aria-label="Kondisimu saat ini">
      {scenario.meters.map((m) => {
        const value = meters[m.key];
        const d = deltas[m.key] ?? 0;
        const pct = ((value - m.min) / (m.max - m.min)) * 100;
        return (
          <li key={m.key} data-testid={`meter-${m.key}`}>
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="text-muted">{m.label}</span>
              <span className="num">
                {value}
                {d !== 0 && (
                  <span
                    className={`ml-1 rounded px-1 font-semibold text-bg ${d > 0 ? "bg-chart-up" : "bg-chart-down"}`}
                    aria-label={`${d > 0 ? "naik" : "turun"} ${Math.abs(d)}`}
                  >
                    {d > 0 ? "▲" : "▼"}
                    {Math.abs(d)}
                  </span>
                )}
              </span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-surface-strong" aria-hidden>
              <div
                className="h-1.5 rounded-full bg-pink transition-[width]"
                style={{ width: `${pct}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
