// Content loaders. Components must use these instead of importing JSON directly:
// this module is the single seam where a headless CMS replaces local JSON later.

import assumptionsJson from "@/content/assumptions.json";
import budgetJson from "@/content/budget.json";
import fallaciesJson from "@/content/fallacies.json";
import provincesJson from "@/content/provinces.json";
import pitchJson from "@/content/pitch.json";
import quizJson from "@/content/quiz.json";
import rantauBakulaJson from "@/content/scenarios/rantau-bakula.json";
import tambangJson from "@/content/scenarios/tambang.json";
import taxJson from "@/content/tax.json";
import { Fallacy, Figure, Pitch, Province, QuizItem, Scenario, TaxRules } from "@/content/schema";

/** Scenario JSON files, keyed by slug. Register new scenarios here (Phase 3). */
const scenarioFiles: Record<string, unknown> = {
  "rantau-bakula": rantauBakulaJson,
  tambang: tambangJson,
};

export function getFallacies(): Fallacy[] {
  return Fallacy.array().parse(fallaciesJson);
}

export function getFallacy(slug: string): Fallacy | undefined {
  return getFallacies().find((f) => f.slug === slug);
}

export function getQuizPool(): QuizItem[] {
  return QuizItem.array().parse(quizJson);
}

export function getBudgetFigures(): Figure[] {
  return Figure.array().parse(budgetJson);
}

export function getAssumptions(): Figure[] {
  return Figure.array().parse(assumptionsJson);
}

export function getTaxRules(): TaxRules {
  return TaxRules.parse(taxJson);
}

export function getProvinces(): Province[] {
  return Province.array().parse(provincesJson);
}

export function getScenarios(): Scenario[] {
  return Object.values(scenarioFiles).map((s) => Scenario.parse(s));
}

export function getScenario(slug: string): Scenario | undefined {
  return getScenarios().find((s) => s.slug === slug);
}

export function getPitch(): Pitch {
  return Pitch.parse(pitchJson);
}

/** Distinct primary sources behind the calculator, for the /tentang page. */
export function getDataSources(): { label: string; url?: string }[] {
  const seen = new Map<string, { label: string; url?: string }>();
  const add = (label: string, url?: string) => {
    if (!seen.has(label)) seen.set(label, { label, url });
  };
  for (const f of [...getBudgetFigures(), ...getAssumptions()]) add(f.source, f.sourceUrl);
  for (const s of getTaxRules().sources) add(s.label, s.url);
  for (const p of getProvinces()) add(p.source, p.sourceUrl);
  return [...seen.values()];
}
