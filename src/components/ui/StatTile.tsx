import type { ReactNode } from "react";

type StatTileProps = {
  label: string;
  value: string;
  hint?: ReactNode;
  testId?: string;
};

/** A labelled headline number. */
export function StatTile({ label, value, hint, testId }: StatTileProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs text-muted">{label}</p>
      <p
        className="num mt-1 text-base font-bold break-words min-[400px]:text-lg sm:text-2xl"
        data-testid={testId}
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
