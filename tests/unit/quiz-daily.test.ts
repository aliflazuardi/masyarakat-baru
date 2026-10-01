import { describe, expect, it } from "vitest";
import {
  LAUNCH_DAY,
  msUntilNextSet,
  pickDailySet,
  quizNumber,
  seededShuffle,
  wibDayIndex,
} from "@/lib/quiz/daily";

const pool = Array.from({ length: 30 }, (_, i) => ({ id: `q${String(i).padStart(3, "0")}` }));

describe("wibDayIndex", () => {
  it("rolls over at midnight WIB, not UTC", () => {
    const before = wibDayIndex(new Date("2026-10-01T23:59:59+07:00"));
    const after = wibDayIndex(new Date("2026-10-02T00:00:00+07:00"));
    expect(after).toBe(before + 1);
    // 16:59 UTC is still the same WIB day as 23:59 WIB.
    expect(wibDayIndex(new Date("2026-10-01T16:59:59Z"))).toBe(before);
    expect(wibDayIndex(new Date("2026-10-01T17:00:00Z"))).toBe(after);
  });
});

describe("quizNumber", () => {
  it("is #1 on launch day", () => {
    expect(quizNumber(LAUNCH_DAY)).toBe(1);
    expect(quizNumber(wibDayIndex(new Date("2026-10-03T08:00:00+07:00")))).toBe(3);
  });
});

describe("msUntilNextSet", () => {
  it("counts down to the next WIB midnight", () => {
    expect(msUntilNextSet(new Date("2026-10-01T23:00:00+07:00"))).toBe(3_600_000);
    expect(msUntilNextSet(new Date("2026-10-02T00:00:00+07:00"))).toBe(86_400_000);
  });
});

describe("seededShuffle", () => {
  it("is deterministic and a permutation", () => {
    const a = seededShuffle(pool, 42);
    expect(seededShuffle(pool, 42)).toEqual(a);
    expect([...a].sort((x, y) => x.id.localeCompare(y.id))).toEqual(pool);
    expect(seededShuffle(pool, 43)).not.toEqual(a);
  });
});

describe("pickDailySet", () => {
  it("gives everyone the same set for the same day", () => {
    expect(pickDailySet(pool, 20_000)).toEqual(pickDailySet([...pool].reverse(), 20_000));
  });

  it("returns 3 distinct items", () => {
    const set = pickDailySet(pool, 20_001);
    expect(set).toHaveLength(3);
    expect(new Set(set.map((q) => q.id)).size).toBe(3);
  });

  it("never repeats an item within a cycle", () => {
    const daysPerCycle = Math.floor(pool.length / 3);
    // Start at a cycle boundary.
    const start = daysPerCycle * 2_000;
    const seen = new Set<string>();
    for (let d = start; d < start + daysPerCycle; d++) {
      for (const q of pickDailySet(pool, d)) {
        expect(seen.has(q.id), `repeat of ${q.id} on day ${d}`).toBe(false);
        seen.add(q.id);
      }
    }
    expect(seen.size).toBe(pool.length);
  });

  it("rejects a pool smaller than a day's set", () => {
    expect(() => pickDailySet(pool.slice(0, 2), 1)).toThrow();
  });
});
