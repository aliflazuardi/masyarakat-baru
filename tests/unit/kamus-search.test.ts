import { describe, expect, it } from "vitest";
import { getFallacies } from "@/lib/content";
import { filterFallacies, normalize } from "@/lib/kamus/search";

const all = getFallacies();
const slugs = (q: string, c: Parameters<typeof filterFallacies>[2] = null) =>
  filterFallacies(all, q, c).map((f) => f.slug);

describe("normalize", () => {
  it("lowercases and strips diacritics", () => {
    expect(normalize("  Pengalihán ÍSU ")).toBe("pengalihan isu");
  });
});

describe("filterFallacies", () => {
  it("returns everything for an empty query", () => {
    expect(slugs("")).toHaveLength(all.length);
  });

  it("matches Indonesian names, English names, slugs and aliases", () => {
    expect(slugs("lereng licin")).toContain("slippery-slope");
    expect(slugs("STRAW MAN")).toContain("straw-man");
    expect(slugs("ad populum")).toContain("bandwagon");
    expect(slugs("efek domino")).toContain("slippery-slope");
  });

  it("requires every term to match", () => {
    expect(slugs("serangan pribadi")).toEqual(["ad-hominem"]);
  });

  it("combines search with the category filter", () => {
    const personal = slugs("", "serangan-personal");
    expect(personal.length).toBeGreaterThan(0);
    expect(
      filterFallacies(all, "", "serangan-personal").every(
        (f) => f.category === "serangan-personal",
      ),
    ).toBe(true);
    expect(slugs("lereng", "serangan-personal")).toEqual([]);
  });

  it("returns nothing for gibberish", () => {
    expect(slugs("zzqxv")).toEqual([]);
  });
});
