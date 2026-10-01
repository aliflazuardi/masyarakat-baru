/** Wordle-style, spoiler-free share text for a finished daily set. */
export function buildShareText(opts: {
  number: number;
  results: readonly boolean[];
  streak: number;
  url: string;
}): string {
  const grid = opts.results.map((ok) => (ok ? "🟩" : "🟥")).join("");
  const score = `${opts.results.filter(Boolean).length}/${opts.results.length}`;
  const streak = opts.streak > 0 ? ` · 🔥 ${opts.streak} hari` : "";
  return `Kuis Sesat Pikir #${opts.number} 🧠\n${grid}  ${score}${streak}\n${opts.url}`;
}

/** Formats a countdown like "05:07:09". */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;
}
