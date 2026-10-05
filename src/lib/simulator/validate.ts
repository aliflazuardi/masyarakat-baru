// Structural checks for scenario content (BUILD_PLAN.md §7.5 "Validation").
// Returns human-readable problems; an empty list means the scenario is playable.

import type { Scenario } from "@/content/schema";

const WEIGHT_TOLERANCE = 1e-9;

function targets(scenario: Scenario, id: string): string[] {
  const node = scenario.nodes[id];
  if (!node || node.type !== "scene") return [];
  return node.choices.flatMap((c) =>
    c.outcomes ? c.outcomes.map((o) => o.next) : c.next ? [c.next] : [],
  );
}

export function validateScenario(scenario: Scenario): string[] {
  const problems: string[] = [];
  const ids = new Set(Object.keys(scenario.nodes));
  const meters = new Set(scenario.meters.map((m) => m.key));

  if (!ids.has(scenario.start)) problems.push(`start node "${scenario.start}" does not exist`);
  for (const m of scenario.meters) {
    if (!(m.min <= m.initial && m.initial <= m.max))
      problems.push(`meter "${m.key}" initial is outside min..max`);
  }

  for (const [id, node] of Object.entries(scenario.nodes)) {
    if (node.type !== "scene") continue;
    if (!node.choices.some((c) => !c.requires)) {
      problems.push(`${id}: every choice is gated by "requires" (the player could get stuck)`);
    }
    node.choices.forEach((c, i) => {
      const where = `${id} choice ${i}`;
      if (!!c.next === !!c.outcomes)
        problems.push(`${where}: set exactly one of "next" or "outcomes"`);
      if (c.next && !ids.has(c.next)) problems.push(`${where}: next "${c.next}" does not exist`);
      if (c.outcomes) {
        const sum = c.outcomes.reduce((s, o) => s + o.weight, 0);
        if (Math.abs(sum - 1) > WEIGHT_TOLERANCE)
          problems.push(`${where}: outcome weights sum to ${sum}, not 1`);
        for (const o of c.outcomes) {
          if (!ids.has(o.next)) problems.push(`${where}: outcome next "${o.next}" does not exist`);
        }
      }
      if (c.requires && !c.lockedReason)
        problems.push(`${where}: "requires" without a "lockedReason"`);
      for (const k of [...Object.keys(c.effects ?? {}), ...Object.keys(c.requires ?? {})]) {
        if (!meters.has(k)) problems.push(`${where}: unknown meter "${k}"`);
      }
    });
  }

  // Reachability from start.
  const reached = new Set<string>();
  const queue = ids.has(scenario.start) ? [scenario.start] : [];
  while (queue.length) {
    const id = queue.pop() as string;
    if (reached.has(id)) continue;
    reached.add(id);
    for (const t of targets(scenario, id)) if (ids.has(t)) queue.push(t);
  }
  for (const id of ids) if (!reached.has(id)) problems.push(`${id}: unreachable from start`);

  // No cycles: every path must end at an ending (DFS with colours).
  const state = new Map<string, "visiting" | "done">();
  const visit = (id: string, trail: string[]): void => {
    if (state.get(id) === "done") return;
    if (state.get(id) === "visiting") {
      problems.push(`cycle: ${[...trail, id].join(" → ")}`);
      return;
    }
    state.set(id, "visiting");
    for (const t of targets(scenario, id)) if (ids.has(t)) visit(t, [...trail, id]);
    state.set(id, "done");
  };
  if (ids.has(scenario.start)) visit(scenario.start, []);

  if (![...ids].some((id) => scenario.nodes[id].type === "ending"))
    problems.push("scenario has no ending");
  return problems;
}
