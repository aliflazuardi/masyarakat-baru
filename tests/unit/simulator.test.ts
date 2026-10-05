import { describe, expect, it } from "vitest";
import type { Scenario } from "@/content/schema";
import { getScenarios } from "@/lib/content";
import {
  choicesFor,
  choose,
  initialState,
  isEnded,
  replay,
  type RunState,
} from "@/lib/simulator/engine";
import { validateScenario } from "@/lib/simulator/validate";

const scenarios = getScenarios();

/** Every ending reachable when choices are always available (ignoring meter locks). */
function allEndingIds(s: Scenario) {
  return Object.entries(s.nodes)
    .filter(([, n]) => n.type === "ending")
    .map(([id]) => id);
}

/** Plays random enabled choices to the end; returns the final state. */
function randomRun(s: Scenario, seed: number): RunState {
  let state = initialState(s, seed);
  let rng = seed;
  for (let i = 0; i < 100 && !isEnded(s, state); i++) {
    const enabled = choicesFor(s, state).filter((c) => c.enabled);
    rng = (rng * 1103515245 + 12345) >>> 0;
    state = choose(s, state, enabled[rng % enabled.length].index);
  }
  return state;
}

describe.each(scenarios.map((s) => [s.slug, s] as const))("scenario %s", (_slug, s) => {
  it("passes structural validation", () => {
    expect(validateScenario(s)).toEqual([]);
  });

  it("has 3–5 endings and a reasonable size", () => {
    expect(allEndingIds(s).length).toBeGreaterThanOrEqual(3);
    expect(Object.keys(s.nodes).length).toBeGreaterThanOrEqual(12);
  });

  it("always reaches an ending in random playthroughs, within a few minutes of play", () => {
    for (let seed = 1; seed <= 300; seed++) {
      const end = randomRun(s, seed);
      expect(isEnded(s, end), `seed ${seed}`).toBe(true);
      expect(end.path.length).toBeLessThanOrEqual(10);
    }
  });

  it("can actually reach every ending with real meter values", () => {
    const reached = new Set<string>();
    for (let seed = 1; seed <= 3000; seed++) reached.add(randomRun(s, seed).node);
    expect([...reached].sort()).toEqual(allEndingIds(s).sort());
  });
});

describe("engine", () => {
  const s = scenarios.find((x) => x.slug === "rantau-bakula")!;

  it("applies effects and clamps meters", () => {
    const st = choose(s, initialState(s, 1), 1); // ajak tetangga: dukungan +10
    expect(st.meters.dukungan).toBe(40);
    expect(st.path[0].deltas).toEqual({ dukungan: 10 });
  });

  it("locks choices whose requirements are not met and explains why", () => {
    const st = choose(s, initialState(s, 1), 1); // → warga
    const sewa = choicesFor(s, st)[0];
    expect(sewa.enabled).toBe(false);
    expect(sewa.lockedReason).toMatch(/Biaya pengacara/);
    expect(() => choose(s, st, 0)).toThrow(/locked/);
  });

  it("is deterministic for a seed and replays saved choices", () => {
    const a = randomRun(s, 42);
    const b = replay(
      s,
      42,
      a.path.map((p) => p.choiceIndex),
    );
    expect(b).toEqual(a);
  });

  it("returns null when saved choices no longer fit", () => {
    expect(replay(s, 1, [99])).toBeNull();
  });

  it("shows outcome percentages for uncertain choices", () => {
    let st = initialState(s, 1);
    st = choose(s, st, 2); // tambal
    st = choose(s, st, 0); // warga
    st = choose(s, st, 2); // mediasi
    st = choose(s, st, 2); // media
    const [media] = choicesFor(s, st);
    expect(media.outcomes?.map((o) => o.percent)).toEqual([50, 50]);
  });
});

describe("validateScenario", () => {
  const base = scenarios[0];
  it("catches broken links, bad weights, cycles and unknown meters", () => {
    const broken = structuredClone(base) as Scenario;
    broken.nodes = {
      a: {
        type: "scene",
        text: "A",
        choices: [
          { label: "loop", next: "b", effects: { nope: 1 } },
          { label: "missing", next: "zzz" },
        ],
      },
      b: {
        type: "scene",
        text: "B",
        choices: [
          {
            label: "back",
            outcomes: [
              { weight: 0.5, next: "a", label: "x" },
              { weight: 0.4, next: "end", label: "y" },
            ],
          },
        ],
      },
      end: { type: "ending", title: "E", text: "E", reflection: "E" },
      orphan: { type: "ending", title: "O", text: "O", reflection: "O" },
    };
    broken.start = "a";
    const problems = validateScenario(broken).join("\n");
    expect(problems).toMatch(/does not exist/);
    expect(problems).toMatch(/weights sum/);
    expect(problems).toMatch(/cycle/);
    expect(problems).toMatch(/unknown meter "nope"/);
    expect(problems).toMatch(/orphan: unreachable/);
  });
});
