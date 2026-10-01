import { describe, expect, it } from "vitest";
import { buildModelInputs } from "@/lib/calculator/data";
import { howMany, perCapita } from "@/lib/calculator/perCapita";
import {
  decodeScenario,
  encodeScenario,
  evaluate,
  normalizeScenario,
  sliderRange,
} from "@/lib/calculator/reallocation";
import {
  formatCount,
  formatDelta,
  formatMultiple,
  formatPercent,
  formatRupiah,
  formatRupiahShort,
} from "@/lib/calculator/format";

const inputs = buildModelInputs();
const T = 1e12;
const baseline = (key: string) => inputs.categories.find((c) => c.key === key)!.baseline;

describe("perCapita", () => {
  it("divides by population and scales by period", () => {
    const r = perCapita(365_000, 10, 4);
    expect(r.perPersonYear).toBe(36_500);
    expect(r.perPersonDay).toBe(100);
    expect(r.perPersonMonth).toBeCloseTo(36_500 / 12);
    expect(r.perHouseholdYear).toBe(146_000);
  });

  it("rejects zero population", () => {
    expect(() => perCapita(1, 0, 1)).toThrow();
  });

  it("counts whole units", () => {
    expect(howMany(45_000, 15_000)).toBe(3);
    expect(howMany(44_999, 15_000)).toBe(2);
    expect(howMany(-5, 15_000)).toBe(0);
  });
});

describe("evaluate (APBN 2026 data)", () => {
  it("reproduces the enacted deficit at baseline", () => {
    const r = evaluate(inputs, {});
    expect(r.totalSpending / T).toBeCloseTo(3842.7, 1);
    expect(r.deficit / T).toBeCloseTo(689.12, 1);
    expect(r.deficitPct).toBeCloseTo(2.68, 2);
    expect(r.overDeficitCap).toBe(false);
    expect(r.belowEducationFloor).toBe(false);
    expect(r.energyPricePressure).toBe("rendah");
  });

  it("flags breaching the 3% deficit cap", () => {
    const r = evaluate(inputs, { alokasi_pertahanan: baseline("alokasi_pertahanan") * 1.5 });
    expect(r.deficitPct).toBeGreaterThan(3);
    expect(r.overDeficitCap).toBe(true);
  });

  it("flags falling below the 20% education floor", () => {
    const r = evaluate(inputs, { alokasi_pendidikan: baseline("alokasi_pendidikan") * 0.5 });
    expect(r.educationPct).toBeLessThan(20);
    expect(r.belowEducationFloor).toBe(true);
  });

  it("grades energy subsidy cuts", () => {
    const e = baseline("alokasi_subsidi_energi");
    expect(evaluate(inputs, { alokasi_subsidi_energi: e * 0.8 }).energyPricePressure).toBe(
      "sedang",
    );
    expect(evaluate(inputs, { alokasi_subsidi_energi: e * 0.6 }).energyPricePressure).toBe(
      "tinggi",
    );
    expect(evaluate(inputs, { alokasi_subsidi_energi: e * 1.2 }).energyCutPct).toBe(0);
  });

  it("reports per-person deltas", () => {
    const r = evaluate(inputs, { alokasi_kesehatan: baseline("alokasi_kesehatan") + 50 * T });
    const kes = r.categories.find((c) => c.key === "alokasi_kesehatan")!;
    expect(kes.deltaPerPerson).toBeCloseTo((50 * T) / 284_670_000);
  });

  it("keeps locked categories fixed and clamps to slider range", () => {
    const locked = inputs.categories.find((c) => c.locked)!;
    expect(sliderRange(locked)).toEqual({ min: locked.baseline, max: locked.baseline });
    const s = normalizeScenario(inputs.categories, {
      [locked.key]: 0,
      alokasi_kesehatan: 1e20,
      nope: 5,
    });
    expect(s[locked.key]).toBe(locked.baseline);
    expect(s.alokasi_kesehatan).toBe(baseline("alokasi_kesehatan") * 1.5);
    expect(s).not.toHaveProperty("nope");
  });
});

describe("scenario URL encoding", () => {
  it("round-trips changed values only", () => {
    const scenario = normalizeScenario(inputs.categories, {
      alokasi_kesehatan: 200 * T,
      alokasi_pertahanan: 300 * T,
    });
    const query = encodeScenario(inputs.categories, scenario);
    expect(query).toBe("alokasi_pertahanan=300.0&alokasi_kesehatan=200.0");
    const decoded = decodeScenario(inputs.categories, query);
    expect(decoded.alokasi_kesehatan).toBeCloseTo(200 * T);
    expect(decoded.alokasi_pendidikan).toBe(baseline("alokasi_pendidikan"));
  });

  it("ignores garbage and clamps out-of-range values", () => {
    const decoded = decodeScenario(
      inputs.categories,
      "alokasi_kesehatan=abc&alokasi_pertahanan=99999",
    );
    expect(decoded.alokasi_kesehatan).toBe(baseline("alokasi_kesehatan"));
    expect(decoded.alokasi_pertahanan).toBe(baseline("alokasi_pertahanan") * 1.5);
  });
});

describe("format", () => {
  it("formats rupiah the Indonesian way", () => {
    expect(formatRupiah(1234567)).toBe("Rp1.234.567");
    expect(formatRupiahShort(3842.7 * T)).toBe("Rp3.842,7 T");
    expect(formatRupiahShort(12_345_000_000)).toBe("Rp12,3 M");
    expect(formatRupiahShort(4_500_000)).toBe("Rp4,5 jt");
    expect(formatPercent(2.68, 2)).toBe("2,68%");
    expect(formatDelta(12000)).toBe("+Rp12.000");
    expect(formatDelta(-3000)).toBe("-Rp3.000");
    expect(formatCount(256_180_000_000)).toBe("256,2 miliar");
    expect(formatCount(3_367_835)).toBe("3,4 juta");
    expect(formatCount(899)).toBe("899");
    expect(formatMultiple(1.4)).toBe("1,4×");
  });
});
