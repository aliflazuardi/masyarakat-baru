import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/** Runs axe (WCAG 2.1 A/AA) and fails with a readable list of violations. */
async function audit(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const summary = results.violations.map(
    (v) =>
      `${v.id} (${v.impact}): ${v.help}\n  ${v.nodes
        .map((n) => n.target.join(" "))
        .slice(0, 5)
        .join("\n  ")}`,
  );
  expect(summary, summary.join("\n")).toEqual([]);
}

const pages = [
  "/",
  "/bahasa-bayi/",
  "/bahasa-bayi/?tab=pajak",
  "/bahasa-bayi/?tab=menkeu",
  "/kuis-sesat-pikir/",
  "/kamus-sesat-pikir/#straw-man",
  "/simulator/",
  "/simulator/rantau-bakula/",
  "/tentang/",
];

for (const path of pages) {
  test(`a11y: ${path}`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await audit(page);
  });
}

test("a11y: quiz feedback state", async ({ page }) => {
  await page.goto("/kuis-sesat-pikir/");
  await page
    .getByRole("group", { name: "Sesat pikir apa yang dipakai?" })
    .getByRole("button")
    .first()
    .click();
  await audit(page);
});

test("a11y: simulator scene with locked choice", async ({ page }) => {
  await page.goto("/simulator/rantau-bakula/");
  await page.getByRole("button", { name: "Mulai simulasi" }).click();
  await page.getByRole("button", { name: /Ajak tetangga/ }).click();
  await audit(page);
});

test("keyboard: skip link and calculator tabs", async ({ page }) => {
  await page.goto("/bahasa-bayi/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Lewati ke konten" })).toBeFocused();
  await page.getByRole("tab", { name: "Angka Raksasa" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Ke Mana Pajakmu?" })).toBeFocused();
  await expect(page.getByRole("tab", { name: "Ke Mana Pajakmu?" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
});
