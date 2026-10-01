import { describe, expect, it } from "vitest";
import {
  displayedStreak,
  EMPTY_STREAK,
  parseStreak,
  recordCompletion,
  type StreakState,
} from "@/lib/quiz/streak";

describe("recordCompletion", () => {
  it("starts a streak at 1", () => {
    expect(recordCompletion(EMPTY_STREAK, 100)).toEqual({ current: 1, best: 1, lastDay: 100 });
  });

  it("increments on consecutive days", () => {
    let s: StreakState = EMPTY_STREAK;
    for (const d of [100, 101, 102]) s = recordCompletion(s, d);
    expect(s).toEqual({ current: 3, best: 3, lastDay: 102 });
  });

  it("does not change when replaying the same day", () => {
    const s = recordCompletion(EMPTY_STREAK, 100);
    expect(recordCompletion(s, 100)).toBe(s);
  });

  it("resets to 1 after a gap but keeps the best", () => {
    let s: StreakState = EMPTY_STREAK;
    for (const d of [100, 101, 102]) s = recordCompletion(s, d);
    s = recordCompletion(s, 105);
    expect(s).toEqual({ current: 1, best: 3, lastDay: 105 });
  });

  it("ignores days earlier than the last completion (clock changes)", () => {
    const s = recordCompletion(EMPTY_STREAK, 100);
    expect(recordCompletion(s, 99)).toBe(s);
  });
});

describe("displayedStreak", () => {
  const s = { current: 4, best: 4, lastDay: 100 };
  it("shows the streak on the completion day and the next day", () => {
    expect(displayedStreak(s, 100)).toBe(4);
    expect(displayedStreak(s, 101)).toBe(4);
  });
  it("shows 0 once a day has been missed", () => {
    expect(displayedStreak(s, 102)).toBe(0);
    expect(displayedStreak(EMPTY_STREAK, 102)).toBe(0);
  });
});

describe("parseStreak", () => {
  it("accepts valid state", () => {
    expect(parseStreak({ current: 2, best: 5, lastDay: 9 })).toEqual({
      current: 2,
      best: 5,
      lastDay: 9,
    });
    expect(parseStreak({ current: 0, best: 0, lastDay: null })).toEqual(EMPTY_STREAK);
  });
  it("rejects corrupt data", () => {
    for (const bad of [
      null,
      "x",
      3,
      {},
      { current: -1, best: 0, lastDay: null },
      { current: 1, best: 1, lastDay: "1" },
    ]) {
      expect(parseStreak(bad)).toEqual(EMPTY_STREAK);
    }
  });
});
