// Content loaders. Components must use these instead of importing JSON directly:
// this module is the single seam where a headless CMS replaces local JSON later.

import assumptionsJson from "@/content/assumptions.json";
import budgetJson from "@/content/budget.json";
import fallaciesJson from "@/content/fallacies.json";
import quizJson from "@/content/quiz.json";
import { Fallacy, Figure, QuizItem, Scenario } from "@/content/schema";

/** Scenario JSON files, keyed by slug. Register new scenarios here (Phase 3). */
const scenarioFiles: Record<string, unknown> = {};

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

export function getScenarios(): Scenario[] {
  return Object.values(scenarioFiles).map((s) => Scenario.parse(s));
}

export function getScenario(slug: string): Scenario | undefined {
  return getScenarios().find((s) => s.slug === slug);
}
