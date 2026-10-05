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

/**
 * How a figure was obtained:
 * - official: published by a government body or in law (must link to a source)
 * - derived: calculated from official figures (the note says how)
 * - estimate: a modelling assumption or rough market price, shown as adjustable
 */
export const FigureKind = z.enum(["official", "derived", "estimate"]);

export const Figure = z
  .object({
    key: z.string().min(1),
    label: z.string().min(1),
    value: z.number(),
    unit: z.enum([
      "IDR",
      "IDR_T", // triliun rupiah
      "persen",
      "orang",
      "rasio",
      "liter",
      "kg",
    ]),
    year: z.number().int().min(2000),
    kind: FigureKind,
    /** Grouping used by the calculator, e.g. "alokasi" for the reallocation sliders. */
    group: z.string().optional(),
    source: z.string().min(1),
    sourceUrl: z.url().optional(),
    note: z.string().optional(),
    /** True until a human has checked the value against the primary document. */
    needsReview: z.boolean().optional(),
  })
  .refine((f) => f.kind !== "official" || f.sourceUrl, {
    message: "official figures must have a sourceUrl",
  })
  .refine((f) => f.kind === "official" || f.note, {
    message: "derived and estimated figures must explain themselves in a note",
  });

// ---------- Tax rules (calculator) ----------

export const TaxRules = z.object({
  year: z.number().int(),
  pph21: z.object({
    /** Progressive brackets on taxable income (PKP), ascending. `upTo: null` is the top bracket. */
    brackets: z
      .array(z.object({ upTo: z.number().nullable(), rate: z.number().gt(0).lt(1) }))
      .min(1),
    ptkp: z.object({
      self: z.number(),
      married: z.number(),
      perDependent: z.number(),
      maxDependents: z.number().int(),
    }),
    biayaJabatan: z.object({ rate: z.number(), maxPerYear: z.number() }),
    /** PKP is rounded down to this multiple before applying rates. */
    pkpRounding: z.number().int(),
  }),
  ppn: z.object({
    /** Effective VAT on most (non-luxury) goods and services. */
    effectiveRate: z.number().gt(0).lt(1),
  }),
  sources: z.array(z.object({ label: z.string(), url: z.url() })).min(1),
  needsReview: z.boolean().optional(),
});

export const Province = z.object({
  key: z.string(),
  name: z.string(),
  ump: z.number().int(),
  year: z.number().int(),
  source: z.string(),
  sourceUrl: z.url(),
  needsReview: z.boolean().optional(),
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
        /** Short description of this outcome, shown before choosing ("Gugatan dikabulkan sebagian"). */
        label: z.string().min(1),
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
  /** Who gains and who loses in this ending (trade-off scenarios). */
  winners: z.array(z.string()).optional(),
  losers: z.array(z.string()).optional(),
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
  /** Short line for the scenario picker. */
  tagline: z.string().min(1),
  /** Explains how outcome probabilities were chosen (estimates vs sourced). */
  probabilityNote: z.string().min(1),
  realStory: z
    .array(
      z.object({
        title: z.string(),
        url: z.url(),
        publisher: z.string(),
        needsReview: z.boolean().optional(),
      }),
    )
    .min(1),
  actions: z.array(
    z.object({
      label: z.string(),
      url: z.url(),
      org: z.string(),
      description: z.string(),
      /** ISO date a human last checked the link is legitimate; null until then. */
      verifiedAt: z.iso.date().nullable(),
    }),
  ),
});

export type Fallacy = z.infer<typeof Fallacy>;
export type FallacyCategory = z.infer<typeof FallacyCategory>;
export type QuizItem = z.infer<typeof QuizItem>;
export type Figure = z.infer<typeof Figure>;
export type FigureKind = z.infer<typeof FigureKind>;
export type TaxRules = z.infer<typeof TaxRules>;
export type Province = z.infer<typeof Province>;
export type Scenario = z.infer<typeof Scenario>;
export type SceneNode = z.infer<typeof SceneNode>;
export type EndingNode = z.infer<typeof EndingNode>;

// ---------- Pitch (landing page and about) ----------

export const Pitch = z.object({
  audience: Figure,
  matrix: z
    .array(
      z.object({
        /** Route slug of the tool, without slashes (matches a TOOLS href). */
        tool: slug,
        intent: z.string().min(1),
        segment: z.string().min(1),
        skill: z.string().min(1),
      }),
    )
    .length(3),
  funnel: z
    .array(
      z.object({
        stage: z.string().min(1),
        detail: z.string().min(1),
        kpi: z.string().nullable(),
      }),
    )
    .length(3),
  roadmap: z
    .array(
      z.object({
        phase: z.string().min(1),
        months: z.string().min(1),
        title: z.string().min(1),
        detail: z.string().min(1),
      }),
    )
    .length(3),
  architecture: z
    .array(z.object({ layer: z.string(), name: z.string(), detail: z.string() }))
    .length(3),
  about: z.object({
    name: z.string().min(1),
    bio: z.string().min(1),
    githubUrl: z.url(),
    repoUrl: z.url(),
  }),
});
export type Pitch = z.infer<typeof Pitch>;
