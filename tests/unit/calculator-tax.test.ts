import { describe, expect, it } from "vitest";
import { getTaxRules } from "@/lib/content";
import { allocate, annualPph21, annualPpn, progressiveTax, ptkp } from "@/lib/calculator/tax";

const rules = getTaxRules();
const single = { married: false, dependents: 0 };

describe("ptkp", () => {
  it("adds marriage and dependent allowances, capped at 3 dependents", () => {
    expect(ptkp(rules, single)).toBe(54_000_000);
    expect(ptkp(rules, { married: true, dependents: 1 })).toBe(63_000_000);
    expect(ptkp(rules, { married: true, dependents: 5 })).toBe(72_000_000);
  });
});

describe("progressiveTax", () => {
  it("applies each bracket only to income inside it", () => {
    expect(progressiveTax(rules, 0)).toBe(0);
    expect(progressiveTax(rules, 60_000_000)).toBe(3_000_000);
    expect(progressiveTax(rules, 250_000_000)).toBe(3_000_000 + 28_500_000);
    // 3M + 28.5M + 62.5M + 4.5B×30% + 1B×35%
    expect(progressiveTax(rules, 6_000_000_000)).toBe(1_794_000_000);
  });
});

describe("annualPph21", () => {
  it("handles a Rp10 juta/month single employee (worked example)", () => {
    const r = annualPph21(rules, 10_000_000, single);
    expect(r.grossYear).toBe(120_000_000);
    expect(r.biayaJabatan).toBe(6_000_000);
    expect(r.pkp).toBe(60_000_000);
    expect(r.pph).toBe(3_000_000);
    expect(r.effectiveRate).toBeCloseTo(0.025);
  });

  it("owes nothing below PTKP", () => {
    expect(annualPph21(rules, 5_000_000, { married: true, dependents: 1 }).pph).toBe(0);
  });

  it("caps biaya jabatan and spans several brackets", () => {
    const r = annualPph21(rules, 50_000_000, { married: true, dependents: 2 });
    expect(r.biayaJabatan).toBe(6_000_000);
    expect(r.pkp).toBe(526_500_000);
    expect(r.pph).toBeCloseTo(101_950_000);
  });

  it("rounds PKP down to the nearest thousand", () => {
    // net - PTKP = 60,000,500 → PKP 60,000,000
    const monthly = (60_000_500 + 54_000_000 + 6_000_000) / 12;
    expect(annualPph21(rules, monthly, single).pkp).toBe(60_000_000);
  });

  it("treats negative income as zero", () => {
    expect(annualPph21(rules, -1, single).pph).toBe(0);
  });
});

describe("annualPpn", () => {
  it("extracts VAT from VAT-inclusive spending", () => {
    // 10 juta × 12 × 40% = 48 juta spent; 48 juta × 0.11 / 1.11
    expect(annualPpn(rules, 10_000_000, 0.4)).toBeCloseTo((48_000_000 * 0.11) / 1.11);
  });

  it("clamps the spend share to 0..1", () => {
    expect(annualPpn(rules, 10_000_000, -1)).toBe(0);
    expect(annualPpn(rules, 10_000_000, 2)).toBeCloseTo(annualPpn(rules, 10_000_000, 1));
  });
});

describe("allocate", () => {
  it("splits proportionally and preserves the total", () => {
    const parts = allocate(1000, [
      { key: "a", label: "A", value: 3 },
      { key: "b", label: "B", value: 1 },
    ]);
    expect(parts.map((p) => p.amount)).toEqual([750, 250]);
    expect(parts.map((p) => p.share)).toEqual([0.75, 0.25]);
  });

  it("rejects an empty budget", () => {
    expect(() => allocate(1, [])).toThrow();
  });
});
