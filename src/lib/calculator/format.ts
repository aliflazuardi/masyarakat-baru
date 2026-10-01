// Indonesian number formatting for the calculator.

const id0 = new Intl.NumberFormat("id-ID", { maximumFractionDigits: 0 });
const id1 = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** "Rp1.234.567" */
export function formatRupiah(n: number): string {
  const sign = n < 0 ? "-" : "";
  return `${sign}Rp${id0.format(Math.round(Math.abs(n)))}`;
}

/** Compact: "Rp3.842,7 T", "Rp12,3 M", "Rp4,5 jt", or full rupiah below a million. */
export function formatRupiahShort(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? "-" : "";
  if (abs >= 1e12) return `${sign}Rp${id1.format(abs / 1e12)} T`;
  if (abs >= 1e9) return `${sign}Rp${id1.format(abs / 1e9)} M`;
  if (abs >= 1e6) return `${sign}Rp${id1.format(abs / 1e6)} jt`;
  return formatRupiah(n);
}

export function formatNumber(n: number): string {
  return id0.format(Math.round(n));
}

export function formatPercent(n: number, digits = 1): string {
  return `${new Intl.NumberFormat("id-ID", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n)}%`;
}

/** "+Rp12.000" / "-Rp3.000" with an explicit sign for deltas. */
export function formatDelta(n: number, short = false): string {
  const body = short ? formatRupiahShort(Math.abs(n)) : formatRupiah(Math.abs(n));
  if (Math.abs(n) < 0.5) return body;
  return `${n > 0 ? "+" : "-"}${body}`;
}

/** Large counts in words: "256,2 miliar", "3,4 juta", else "12.345". */
export function formatCount(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1e12) return `${id1.format(n / 1e12)} triliun`;
  if (abs >= 1e9) return `${id1.format(n / 1e9)} miliar`;
  if (abs >= 1e6) return `${id1.format(n / 1e6)} juta`;
  return id0.format(Math.round(n));
}

/** "1,4×" */
export function formatMultiple(n: number): string {
  return `${id1.format(n)}×`;
}
