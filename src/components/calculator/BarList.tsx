import { formatRupiah, formatPercent } from "@/lib/calculator/format";

type Row = { key: string; label: string; amount: number; share: number };

/**
 * Ranked horizontal bars (single series, one hue). Every bar is direct-labelled
 * with its value, so the list doubles as the table view.
 */
export function BarList({ rows, caption }: { rows: Row[]; caption: string }) {
  const sorted = [...rows].sort((a, b) => b.amount - a.amount);
  const max = sorted[0]?.amount || 1;
  return (
    <figure>
      <figcaption className="sr-only">{caption}</figcaption>
      <ul className="grid gap-3">
        {sorted.map((r) => (
          <li key={r.key}>
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span>{r.label}</span>
              <span className="num shrink-0 text-text">
                {formatRupiah(r.amount)}{" "}
                <span className="text-muted">· {formatPercent(r.share * 100)}</span>
              </span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-surface-strong" aria-hidden>
              <div
                className="h-2 rounded-full bg-chart-up"
                style={{ width: `${Math.max((r.amount / max) * 100, 0.5)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </figure>
  );
}
