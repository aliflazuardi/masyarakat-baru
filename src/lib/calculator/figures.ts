import type { Figure } from "@/content/schema";

export const TRILIUN = 1e12;

/** Index figures by key; throws on duplicates so data mistakes fail loudly. */
export function indexFigures(figures: readonly Figure[]): Map<string, Figure> {
  const map = new Map<string, Figure>();
  for (const f of figures) {
    if (map.has(f.key)) throw new Error(`Duplicate figure key: ${f.key}`);
    map.set(f.key, f);
  }
  return map;
}

/** Looks up a figure that the calculator depends on. */
export function requireFigure(index: Map<string, Figure>, key: string): Figure {
  const f = index.get(key);
  if (!f) throw new Error(`Missing figure: ${key}`);
  return f;
}

/** A figure's value in rupiah, converting from triliun when needed. */
export function rupiah(f: Figure): number {
  if (f.unit === "IDR_T") return f.value * TRILIUN;
  if (f.unit === "IDR") return f.value;
  throw new Error(`Figure ${f.key} is not a rupiah amount (unit ${f.unit})`);
}
