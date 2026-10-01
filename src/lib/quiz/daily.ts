// Deterministic daily quiz selection: everyone gets the same set on the same
// WIB (Asia/Jakarta, UTC+7) date, with no backend.

export const QUESTIONS_PER_DAY = 3;

const DAY_MS = 86_400_000;
const WIB_OFFSET_MS = 7 * 3_600_000;

/** Launch date; quiz #1 is this WIB date. */
export const LAUNCH_DAY = wibDayIndex(new Date("2026-10-01T00:00:00+07:00"));

/** Whole days since the Unix epoch, counted in WIB. Indonesia has no DST. */
export function wibDayIndex(now: Date): number {
  return Math.floor((now.getTime() + WIB_OFFSET_MS) / DAY_MS);
}

/** Human-facing quiz number (#1 on launch day). */
export function quizNumber(day: number): number {
  return day - LAUNCH_DAY + 1;
}

/** Milliseconds until the next WIB midnight, when a new set unlocks. */
export function msUntilNextSet(now: Date): number {
  const nextDayStart = (wibDayIndex(now) + 1) * DAY_MS - WIB_OFFSET_MS;
  return nextDayStart - now.getTime();
}

/** mulberry32: tiny, fast, seedable PRNG returning floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/** Fisher–Yates shuffle with a seeded PRNG. Returns a new array. */
export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const out = [...items];
  const rand = mulberry32(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/**
 * Picks `n` items for a given day. The pool is shuffled once per "cycle"
 * (floor(pool.length / n) days) and sliced day by day, so no item repeats
 * within a cycle. Items are sorted by id first so JSON order doesn't matter.
 */
export function pickDailySet<T extends { id: string }>(
  pool: readonly T[],
  day: number,
  n = QUESTIONS_PER_DAY,
): T[] {
  if (pool.length < n) throw new Error(`Quiz pool needs at least ${n} items, has ${pool.length}`);
  const sorted = [...pool].sort((a, b) => a.id.localeCompare(b.id));
  const daysPerCycle = Math.floor(sorted.length / n);
  const cycle = Math.floor(day / daysPerCycle);
  const slot = day - cycle * daysPerCycle;
  return seededShuffle(sorted, cycle).slice(slot * n, slot * n + n);
}
