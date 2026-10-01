import type { Fallacy, FallacyCategory } from "@/content/schema";

export const CATEGORY_LABELS: Record<FallacyCategory, string> = {
  "serangan-personal": "Serangan Personal",
  pengalihan: "Pengalihan",
  "logika-keliru": "Logika Keliru",
  "manipulasi-emosi": "Manipulasi Emosi",
};

/** Lowercases and strips diacritics so "Pengalihán" matches "pengalihan". */
export function normalize(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function haystack(f: Fallacy): string {
  return normalize(
    [f.nameId, f.nameEn, f.slug.replace(/-/g, " "), ...f.aliases, f.definition].join(" "),
  );
}

/**
 * Filters fallacies by a free-text query and an optional category.
 * Every whitespace-separated term in the query must match (AND), in any field.
 */
export function filterFallacies(
  fallacies: readonly Fallacy[],
  query: string,
  category: FallacyCategory | null,
): Fallacy[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return fallacies.filter((f) => {
    if (category && f.category !== category) return false;
    if (terms.length === 0) return true;
    const text = haystack(f);
    return terms.every((t) => text.includes(t));
  });
}
