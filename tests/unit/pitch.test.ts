import { describe, expect, it } from "vitest";
import { getDataSources, getPitch } from "@/lib/content";
import { TOOLS } from "@/lib/site";

describe("pitch content", () => {
  it("parses against its schema", () => {
    expect(() => getPitch()).not.toThrow();
  });

  it("has one matrix row per tool, in the same order as the tool cards", () => {
    const slugs = TOOLS.map((t) => t.href.replaceAll("/", ""));
    expect(getPitch().matrix.map((m) => m.tool)).toEqual(slugs);
  });

  it("sources the audience figure", () => {
    const { audience } = getPitch();
    expect(audience.source).toBeTruthy();
    expect(audience.value).toBeGreaterThan(0);
  });

  it("lists distinct data sources, each with a label", () => {
    const sources = getDataSources();
    expect(sources.length).toBeGreaterThan(3);
    expect(new Set(sources.map((s) => s.label)).size).toBe(sources.length);
  });
});
