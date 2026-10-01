// zod schemas for all editorial content (BUILD_PLAN.md §8).
// Every JSON file in src/content is validated against these in tests.

import { z } from "zod";

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be kebab-case");

// ---------- Fallacies (Kamus Sesat Pikir) ----------

export const FallacyCategory = z.enum([
  "serangan-personal",
  "pengalihan",
  "logika-keliru",
  "manipulasi-emosi",
]);

export const Fallacy = z.object({
  slug,
  nameId: z.string().min(1),
  nameEn: z.string().min(1),
  aliases: z.array(z.string()),
  category: FallacyCategory,
  definition: z.string().min(1),
  example: z.string().min(1),
  counter: z.string().min(1),
  related: z.array(slug),
});

// ---------- Quiz (Kuis Sesat Pikir) ----------

/** Option value for a statement that contains no fallacy. */
export const VALID_ARGUMENT = "valid";

export const QuizItem = z
  .object({
    id: z.string().min(1),
    context: z.string().min(1),
    statement: z.string().min(1),
    options: z.array(z.string()).length(3),
    answer: z.string(),
    explanation: z.string().min(1),
  })
  .refine((q) => q.options.includes(q.answer), { message: "answer must be one of options" })
  .refine((q) => new Set(q.options).size === q.options.length, {
    message: "options must be unique",
  });

// ---------- Figures (budget and assumptions for the calculator) ----------

export const Figure = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  value: z.number(),
  unit: z.enum(["IDR", "persen", "orang", "rasio", "IDR/tahun", "IDR/bulan"]),
  year: z.number().int().min(2000),
  source: z.string().min(1),
  sourceUrl: z.url(),
  note: z.string().optional(),
});

// ---------- Scenarios (Impact Simulator) ----------

export const Meter = z.object({
  key: z.string().min(1),
  label: z.string().min(1),
  initial: z.number(),
  min: z.number(),
  max: z.number(),
});

const Effects = z.record(z.string(), z.number());

export const Choice = z.object({
  label: z.string().min(1),
  effects: Effects.optional(),
  /** Minimum meter values needed to pick this choice. */
  requires: z.record(z.string(), z.number()).optional(),
  /** Shown when `requires` is not met. */
  lockedReason: z.string().optional(),
  /** Deterministic next node. Exactly one of `next` or `outcomes` must be set. */
  next: z.string().optional(),
  /** Weighted probabilistic branches; weights must sum to 1. */
  outcomes: z
    .array(
      z.object({
        weight: z.number().gt(0).lte(1),
        next: z.string(),
        label: z.string().optional(),
        source: z.string().optional(),
      }),
    )
    .optional(),
});

export const SceneNode = z.object({
  type: z.literal("scene"),
  title: z.string().optional(),
  text: z.string().min(1),
  image: z.string().optional(),
  choices: z.array(Choice).min(1),
});

export const EndingNode = z.object({
  type: z.literal("ending"),
  title: z.string().min(1),
  text: z.string().min(1),
  reflection: z.string().min(1),
  image: z.string().optional(),
});

export const Scenario = z.object({
  slug,
  title: z.string().min(1),
  perspective: z.string().min(1),
  intro: z.string().min(1),
  disclaimer: z.string().min(1),
  meters: z.array(Meter).min(1),
  start: z.string(),
  nodes: z.record(z.string(), z.discriminatedUnion("type", [SceneNode, EndingNode])),
  realStory: z.array(z.object({ title: z.string(), url: z.url() })),
  actions: z.array(
    z.object({
      label: z.string(),
      url: z.url(),
      org: z.string(),
      /** ISO date the link was last checked to be legitimate. */
      verifiedAt: z.iso.date(),
    }),
  ),
});

export type Fallacy = z.infer<typeof Fallacy>;
export type FallacyCategory = z.infer<typeof FallacyCategory>;
export type QuizItem = z.infer<typeof QuizItem>;
export type Figure = z.infer<typeof Figure>;
export type Scenario = z.infer<typeof Scenario>;
export type SceneNode = z.infer<typeof SceneNode>;
export type EndingNode = z.infer<typeof EndingNode>;
