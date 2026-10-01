// Daily streak rules (BUILD_PLAN.md §7.3). Days are WIB day indexes from daily.ts.

export type StreakState = {
  current: number;
  best: number;
  /** WIB day index of the last completed set, or null if never played. */
  lastDay: number | null;
};

export const EMPTY_STREAK: StreakState = { current: 0, best: 0, lastDay: null };

/** Applies completing the set for `day`. Replaying the same day changes nothing. */
export function recordCompletion(state: StreakState, day: number): StreakState {
  if (state.lastDay !== null && day <= state.lastDay) return state;
  const current = state.lastDay === day - 1 ? state.current + 1 : 1;
  return { current, best: Math.max(state.best, current), lastDay: day };
}

/** Streak to display on `today`: it lapses once a whole day is missed. */
export function displayedStreak(state: StreakState, today: number): number {
  if (state.lastDay === null) return 0;
  return today - state.lastDay <= 1 ? state.current : 0;
}

/** Narrows untrusted storage data to a valid StreakState. */
export function parseStreak(value: unknown): StreakState {
  if (typeof value !== "object" || value === null) return EMPTY_STREAK;
  const v = value as Record<string, unknown>;
  const isCount = (x: unknown): x is number => Number.isInteger(x) && (x as number) >= 0;
  if (!isCount(v.current) || !isCount(v.best)) return EMPTY_STREAK;
  if (v.lastDay !== null && !Number.isInteger(v.lastDay)) return EMPTY_STREAK;
  return { current: v.current, best: v.best, lastDay: v.lastDay as number | null };
}
