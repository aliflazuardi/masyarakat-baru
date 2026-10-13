import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Client components must not import modules that pull zod or content JSON into
// the browser bundle (that once added ~400 KB of JS). Type-only imports are fine.
const SERVER_ONLY = ["@/content/schema", "@/lib/content", "@/lib/calculator/data", "@/lib/og"];

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? files(p) : /\.tsx?$/.test(p) ? [p] : [];
  });
}

describe("client bundle boundaries", () => {
  const clientFiles = files("src").filter((f) =>
    /^["']use client["']/m.test(readFileSync(f, "utf8")),
  );

  it("finds client components to check", () => {
    expect(clientFiles.length).toBeGreaterThan(5);
  });

  it.each(clientFiles)("%s has no value imports from server-only modules", (file) => {
    const src = readFileSync(file, "utf8");
    const bad = [...src.matchAll(/^import\s+(?!type\b)[^;]*?from\s+"([^"]+)"/gm)]
      .map((m) => m[1])
      .filter((spec) => SERVER_ONLY.includes(spec));
    expect(bad).toEqual([]);
  });
});
