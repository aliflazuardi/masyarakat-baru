// Tab 2, "Ke Mana Pajakmu?": a simplified annual PPh 21 + PPN estimate for an employee.
// Simplifications (shown in the UI): one employer, no pension contributions or
// other deductions, no TER withholding schedule (the annual result is what matters).

import type { TaxRules } from "@/content/schema";

export type Household = {
  married: boolean;
  /** Dependents claimed (capped by the rules). */
  dependents: number;
};

export function ptkp(rules: TaxRules, h: Household): number {
  const { self, married, perDependent, maxDependents } = rules.pph21.ptkp;
  const deps = Math.min(Math.max(0, Math.floor(h.dependents)), maxDependents);
  return self + (h.married ? married : 0) + deps * perDependent;
}

/** Progressive tax on taxable income (PKP) using the bracket table. */
export function progressiveTax(rules: TaxRules, pkp: number): number {
  let tax = 0;
  let lower = 0;
  for (const { upTo, rate } of rules.pph21.brackets) {
    if (pkp <= lower) break;
    const top = upTo === null ? pkp : Math.min(pkp, upTo);
    tax += (top - lower) * rate;
    if (upTo === null) break;
    lower = upTo;
  }
  return tax;
}

export type PphBreakdown = {
  grossYear: number;
  biayaJabatan: number;
  netYear: number;
  ptkp: number;
  pkp: number;
  pph: number;
  /** Tax as a share of gross income. */
  effectiveRate: number;
};

export function annualPph21(rules: TaxRules, grossMonthly: number, h: Household): PphBreakdown {
  const grossYear = Math.max(0, grossMonthly) * 12;
  const { rate, maxPerYear } = rules.pph21.biayaJabatan;
  const biayaJabatan = Math.min(grossYear * rate, maxPerYear);
  const netYear = grossYear - biayaJabatan;
  const allowance = ptkp(rules, h);
  const step = rules.pph21.pkpRounding;
  const pkp = Math.max(0, Math.floor((netYear - allowance) / step) * step);
  const pph = progressiveTax(rules, pkp);
  return {
    grossYear,
    biayaJabatan,
    netYear,
    ptkp: allowance,
    pkp,
    pph,
    effectiveRate: grossYear > 0 ? pph / grossYear : 0,
  };
}

/**
 * VAT embedded in spending. Shelf prices already include PPN, so the tax share
 * of a VAT-inclusive amount is rate / (1 + rate).
 */
export function annualPpn(
  rules: TaxRules,
  grossMonthly: number,
  taxableSpendShare: number,
): number {
  const share = Math.min(Math.max(taxableSpendShare, 0), 1);
  const spendYear = Math.max(0, grossMonthly) * 12 * share;
  const r = rules.ppn.effectiveRate;
  return (spendYear * r) / (1 + r);
}

export type Allocation = { key: string; label: string; amount: number; share: number };

/**
 * Splits an amount proportionally across budget categories. Illustrative only:
 * tax revenue is pooled, so no rupiah is earmarked for a specific category.
 */
export function allocate(
  amount: number,
  categories: readonly { key: string; label: string; value: number }[],
): Allocation[] {
  const total = categories.reduce((s, c) => s + c.value, 0);
  if (total <= 0) throw new Error("categories must have a positive total");
  return categories.map((c) => ({
    key: c.key,
    label: c.label,
    share: c.value / total,
    amount: (amount * c.value) / total,
  }));
}
