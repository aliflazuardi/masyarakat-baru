import { describe, expect, it } from "vitest";
import { answersForDay, scoreAnswers } from "@/lib/quiz/progress";
import { buildShareText, formatCountdown } from "@/lib/quiz/share";

describe("buildShareText", () => {
  it("builds a spoiler-free Wordle-style summary", () => {
    expect(
      buildShareText({
        number: 128,
        results: [true, true, false],
        streak: 5,
        url: "https://x.test/kuis/",
      }),
    ).toBe("Kuis Sesat Pikir #128 🧠\n🟩🟩🟥  2/3 · 🔥 5 hari\nhttps://x.test/kuis/");
  });

  it("omits the streak when it is zero", () => {
    expect(buildShareText({ number: 1, results: [true], streak: 0, url: "u" })).toBe(
      "Kuis Sesat Pikir #1 🧠\n🟩  1/1\nu",
    );
  });
});

describe("formatCountdown", () => {
  it("formats hours, minutes and seconds", () => {
    expect(formatCountdown(5 * 3_600_000 + 7 * 60_000 + 9_000)).toBe("05:07:09");
    expect(formatCountdown(-5)).toBe("00:00:00");
  });
});

describe("answersForDay", () => {
  it("returns saved answers for the same day only", () => {
    expect(answersForDay({ day: 5, answers: ["a", "b"] }, 5, 3)).toEqual(["a", "b"]);
    expect(answersForDay({ day: 4, answers: ["a"] }, 5, 3)).toEqual([]);
  });
  it("rejects malformed data and caps the length", () => {
    expect(answersForDay(null, 5, 3)).toEqual([]);
    expect(answersForDay({ day: 5, answers: [1, 2] }, 5, 3)).toEqual([]);
    expect(answersForDay({ day: 5, answers: ["a", "b", "c", "d"] }, 5, 3)).toEqual(["a", "b", "c"]);
  });
});

describe("scoreAnswers", () => {
  it("marks each answer against the key", () => {
    expect(scoreAnswers(["a", "x"], ["a", "b", "c"])).toEqual([true, false]);
  });
});
