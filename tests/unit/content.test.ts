import { describe, expect, it } from "vitest";
import {
  getAssumptions,
  getBudgetFigures,
  getFallacies,
  getQuizPool,
  getScenarios,
} from "@/lib/content";
import { QuizItem, Scenario, VALID_ARGUMENT } from "@/content/schema";

// Every content file must parse against its schema (BUILD_PLAN.md §8).
describe("content files", () => {
  it("parse against their schemas", () => {
    expect(() => getFallacies()).not.toThrow();
    expect(() => getQuizPool()).not.toThrow();
    expect(() => getBudgetFigures()).not.toThrow();
    expect(() => getAssumptions()).not.toThrow();
    expect(() => getScenarios()).not.toThrow();
  });

  it("have unique fallacy slugs and resolvable related links", () => {
    const fallacies = getFallacies();
    const slugs = new Set(fallacies.map((f) => f.slug));
    expect(slugs.size).toBe(fallacies.length);
    for (const f of fallacies) {
      for (const r of f.related) expect(slugs, `${f.slug} -> ${r}`).toContain(r);
    }
  });

  it("have quiz options that resolve to a fallacy or the valid option", () => {
    const slugs = new Set(getFallacies().map((f) => f.slug));
    for (const q of getQuizPool()) {
      for (const o of q.options) {
        expect(o === VALID_ARGUMENT || slugs.has(o), `${q.id}: unknown option ${o}`).toBe(true);
      }
    }
  });
});

describe("Phase 1 content", () => {
  it("has the planned fallacy set and a big enough quiz pool", () => {
    expect(getFallacies().length).toBeGreaterThanOrEqual(18);
    // At least one week of 3-per-day sets (BUILD_PLAN.md §7.3).
    expect(getQuizPool().length).toBeGreaterThanOrEqual(21);
  });

  it("has unique quiz ids", () => {
    const ids = getQuizPool().map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("covers every fallacy and includes valid arguments", () => {
    const answers = new Set(getQuizPool().map((q) => q.answer));
    for (const f of getFallacies()) expect(answers, `no question for ${f.slug}`).toContain(f.slug);
    expect(answers).toContain(VALID_ARGUMENT);
  });

  it("keeps explanations to at most two sentences", () => {
    for (const q of getQuizPool()) {
      // Count sentence-ending punctuation outside quoted phrases.
      const sentences = q.explanation
        .replace(/"[^"]*"/g, "")
        .split(/[.!?](?:\s|$)/)
        .filter((s) => s.trim());
      expect(sentences.length, q.id).toBeLessThanOrEqual(2);
    }
  });
});

describe("schemas", () => {
  it("reject a quiz answer that is not among the options", () => {
    const result = QuizItem.safeParse({
      id: "q1",
      context: "Komentar warganet",
      statement: "Contoh",
      options: ["ad-hominem", "straw-man", VALID_ARGUMENT],
      answer: "slippery-slope",
      explanation: "Contoh penjelasan.",
    });
    expect(result.success).toBe(false);
  });

  it("reject a scenario action link without a verification date", () => {
    const result = Scenario.safeParse({
      slug: "contoh",
      title: "Contoh",
      perspective: "Warga",
      intro: "Intro",
      disclaimer: "Disclaimer",
      meters: [{ key: "dana", label: "Dana", initial: 50, min: 0, max: 100 }],
      start: "a",
      nodes: { a: { type: "ending", title: "Akhir", text: "Teks", reflection: "Refleksi" } },
      realStory: [],
      actions: [{ label: "Donasi", url: "https://example.org", org: "Contoh" }],
    });
    expect(result.success).toBe(false);
  });
});
