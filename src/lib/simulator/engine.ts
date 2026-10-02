// Branching-narrative engine for the Impact Simulator (BUILD_PLAN.md §7.5).
// Pure and deterministic: given a scenario, a seed and a list of choice indexes,
// the run always plays out the same way, so it can be saved, replayed and tested.

import type { Scenario, SceneNode } from "@/content/schema";
import { mulberry32 } from "@/lib/random";

type ChoiceDef = SceneNode["choices"][number];

export type Meters = Record<string, number>;

export type Step = {
  from: string;
  choiceIndex: number;
  to: string;
  /** Label of the probabilistic outcome that happened, if any. */
  outcome?: string;
  /** Meter changes caused by this step (after clamping). */
  deltas: Meters;
};

export type RunState = {
  seed: number;
  node: string;
  meters: Meters;
  path: Step[];
};

export type ChoiceView = {
  index: number;
  label: string;
  enabled: boolean;
  lockedReason?: string;
  /** Possible outcomes with rounded percentages, for uncertain choices. */
  outcomes?: { label: string; percent: number; source?: string }[];
  effects: Meters;
};

export function initialState(scenario: Scenario, seed: number): RunState {
  return {
    seed: seed >>> 0,
    node: scenario.start,
    meters: Object.fromEntries(scenario.meters.map((m) => [m.key, m.initial])),
    path: [],
  };
}

export function currentNode(scenario: Scenario, state: RunState) {
  const node = scenario.nodes[state.node];
  if (!node) throw new Error(`Unknown node: ${state.node}`);
  return node;
}

export function isEnded(scenario: Scenario, state: RunState): boolean {
  return currentNode(scenario, state).type === "ending";
}

function meetsRequirements(choice: ChoiceDef, meters: Meters): boolean {
  return Object.entries(choice.requires ?? {}).every(([k, min]) => (meters[k] ?? 0) >= min);
}

export function choicesFor(scenario: Scenario, state: RunState): ChoiceView[] {
  const node = currentNode(scenario, state);
  if (node.type !== "scene") return [];
  return node.choices.map((c, index) => {
    const enabled = meetsRequirements(c, state.meters);
    return {
      index,
      label: c.label,
      enabled,
      lockedReason: enabled ? undefined : c.lockedReason,
      outcomes: c.outcomes?.map((o) => ({
        label: o.label,
        percent: Math.round(o.weight * 100),
        source: o.source,
      })),
      effects: c.effects ?? {},
    };
  });
}

/** Picks a weighted outcome using a PRNG stream derived from the seed and step number. */
function pickOutcome(outcomes: NonNullable<ChoiceDef["outcomes"]>, seed: number, step: number) {
  const roll = mulberry32((seed ^ Math.imul(step + 1, 0x9e3779b1)) >>> 0)();
  let acc = 0;
  for (const o of outcomes) {
    acc += o.weight;
    if (roll < acc) return o;
  }
  return outcomes[outcomes.length - 1];
}

/** Applies a choice and returns the new state. Throws on an invalid or locked choice. */
export function choose(scenario: Scenario, state: RunState, choiceIndex: number): RunState {
  const node = currentNode(scenario, state);
  if (node.type !== "scene") throw new Error("Run has already ended");
  const choice = node.choices[choiceIndex];
  if (!choice) throw new Error(`No choice ${choiceIndex} at ${state.node}`);
  if (!meetsRequirements(choice, state.meters)) throw new Error(`Choice ${choiceIndex} is locked`);

  const meters = { ...state.meters };
  const deltas: Meters = {};
  for (const m of scenario.meters) {
    const change = choice.effects?.[m.key] ?? 0;
    if (!change) continue;
    const next = Math.min(m.max, Math.max(m.min, meters[m.key] + change));
    deltas[m.key] = next - meters[m.key];
    meters[m.key] = next;
  }

  let to: string;
  let outcome: string | undefined;
  if (choice.outcomes) {
    const picked = pickOutcome(choice.outcomes, state.seed, state.path.length);
    to = picked.next;
    outcome = picked.label;
  } else {
    to = choice.next as string;
  }

  return {
    seed: state.seed,
    node: to,
    meters,
    path: [...state.path, { from: state.node, choiceIndex, to, outcome, deltas }],
  };
}

/**
 * Rebuilds a run from a seed and saved choice indexes. Returns null if the saved
 * choices no longer fit the scenario (e.g. content changed), so callers can restart.
 */
export function replay(
  scenario: Scenario,
  seed: number,
  choices: readonly number[],
): RunState | null {
  let state = initialState(scenario, seed);
  try {
    for (const c of choices) state = choose(scenario, state, c);
    return state;
  } catch {
    return null;
  }
}
