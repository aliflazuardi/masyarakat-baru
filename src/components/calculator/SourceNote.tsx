import type { Figure } from "@/content/schema";

const KIND_LABEL = { official: "Resmi", derived: "Turunan", estimate: "Perkiraan" } as const;

/** Small "Sumber" line under a number: every figure on screen is traceable. */
export function SourceNote({ figure }: { figure: Figure }) {
  return (
    <p className="text-xs text-muted">
      <span className="rounded border border-border px-1.5 py-0.5">{KIND_LABEL[figure.kind]}</span>{" "}
      Sumber:{" "}
      {figure.sourceUrl ? (
        <a
          href={figure.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-text"
        >
          {figure.source}
        </a>
      ) : (
        figure.source
      )}
      {figure.year ? ` (${figure.year})` : ""}
      {figure.note && <span className="block mt-1">{figure.note}</span>}
    </p>
  );
}

export { KIND_LABEL };
