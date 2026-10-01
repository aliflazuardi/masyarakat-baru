import { describe, expect, it, vi } from "vitest";
import { track } from "@/lib/analytics";

describe("track", () => {
  it("forwards events to umami when present", () => {
    const umami = { track: vi.fn() };
    track({ name: "quiz_completed", props: { score: 3, streak: 5 } }, { umami });
    expect(umami.track).toHaveBeenCalledWith("quiz_completed", { score: 3, streak: 5 });
  });

  it("is a no-op without a provider", () => {
    expect(() =>
      track({ name: "kamus_card_opened", props: { slug: "ad-hominem" } }, undefined),
    ).not.toThrow();
    expect(() =>
      track({ name: "kamus_card_opened", props: { slug: "ad-hominem" } }, {}),
    ).not.toThrow();
  });

  it("swallows provider errors", () => {
    const umami = {
      track: () => {
        throw new Error("network");
      },
    };
    expect(() =>
      track({ name: "calculator_shared", props: { tab: "pajak" } }, { umami }),
    ).not.toThrow();
  });
});
