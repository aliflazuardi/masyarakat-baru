import { describe, expect, it } from "vitest";
import { getAssumptions, getBudgetFigures, getProvinces, getTaxRules } from "@/lib/content";
import { indexFigures, requireFigure } from "@/lib/calculator/figures";
import { REQUIRED_FIGURES } from "@/lib/calculator/data";

const budget = getBudgetFigures();
const all = indexFigures([...budget, ...getAssumptions()]);

describe("calculator data", () => {
  it("has every figure the calculator needs", () => {
    for (const key of REQUIRED_FIGURES) expect(() => requireFigure(all, key), key).not.toThrow();
  });

  it("has slider categories that sum to total spending (no double counting)", () => {
    const sum = budget.filter((f) => f.group === "alokasi").reduce((s, f) => s + f.value, 0);
    expect(sum).toBeCloseTo(requireFigure(all, "belanja_negara").value, 1);
  });

  it("is internally consistent: spending − revenue = deficit", () => {
    const v = (k: string) => requireFigure(all, k).value;
    expect(v("belanja_negara") - v("pendapatan_negara")).toBeCloseTo(v("defisit_apbn"), 0);
  });

  it("has tax brackets in ascending order with an open top bracket", () => {
    const b = getTaxRules().pph21.brackets;
    const limits = b.slice(0, -1).map((x) => x.upTo as number);
    expect([...limits].sort((x, y) => x - y)).toEqual(limits);
    expect(b.at(-1)!.upTo).toBeNull();
  });

  it("has provinces with plausible minimum wages", () => {
    for (const p of getProvinces()) {
      expect(p.ump, p.name).toBeGreaterThan(1_500_000);
      expect(p.ump, p.name).toBeLessThan(10_000_000);
    }
  });
});
