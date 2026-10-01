type MeterProps = {
  label: string;
  value: number;
  /** Scale maximum. */
  max: number;
  /** Legal limit drawn as a marker. */
  limit: number;
  limitLabel: string;
  /** Whether exceeding (true) or falling below (false) the limit is the problem. */
  badWhenAbove: boolean;
  valueText: string;
  okText: string;
  badText: string;
  testId?: string;
};

/** A bar with a marker at a legal limit, plus an icon + text status (never colour alone). */
export function Meter(p: MeterProps) {
  const bad = p.badWhenAbove ? p.value > p.limit : p.value < p.limit;
  const pct = (v: number) => `${Math.min(Math.max((v / p.max) * 100, 0), 100)}%`;
  return (
    <div
      className="rounded-xl border border-border bg-surface p-4"
      data-testid={p.testId}
      data-status={bad ? "bad" : "ok"}
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-sm font-semibold">{p.label}</p>
        <p className="num text-lg font-bold">{p.valueText}</p>
      </div>
      <div
        role="meter"
        aria-label={p.label}
        aria-valuemin={0}
        aria-valuemax={p.max}
        aria-valuenow={Number(p.value.toFixed(2))}
        aria-valuetext={p.valueText}
        className="relative mt-3 h-2.5 rounded-full bg-surface-strong"
      >
        <div
          className={`h-2.5 rounded-full ${bad ? "bg-bad" : "bg-good"}`}
          style={{ width: pct(p.value) }}
        />
        <div
          className="absolute -top-1 h-4.5 w-0.5 bg-text"
          style={{ left: pct(p.limit) }}
          aria-hidden
        />
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted">
        <span />
        <span>{p.limitLabel}</span>
      </div>
      <p className={`mt-2 text-sm ${bad ? "text-bad" : "text-good"}`} aria-live="polite">
        {bad ? "⚠ " : "✓ "}
        {bad ? p.badText : p.okText}
      </p>
    </div>
  );
}
