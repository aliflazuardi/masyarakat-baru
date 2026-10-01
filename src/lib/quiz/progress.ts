// Today's in-progress or finished answers, so a reload resumes the set
// (and a finished set can't be replayed for a better score).

export type DailyProgress = { day: number; answers: string[] };

/** Returns saved answers if they belong to `day`, otherwise an empty list. */
export function answersForDay(saved: unknown, day: number, maxAnswers: number): string[] {
  if (typeof saved !== "object" || saved === null) return [];
  const v = saved as Record<string, unknown>;
  if (v.day !== day || !Array.isArray(v.answers)) return [];
  if (!v.answers.every((a) => typeof a === "string")) return [];
  return (v.answers as string[]).slice(0, maxAnswers);
}

/** Per-question correctness for the answers given so far. */
export function scoreAnswers(answers: readonly string[], correct: readonly string[]): boolean[] {
  return answers.map((a, i) => a === correct[i]);
}
