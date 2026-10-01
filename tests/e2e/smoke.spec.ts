import { expect, test } from "@playwright/test";

const routes = [
  { path: "/", heading: /Dari penonton menjadi warga/i },
  { path: "/bahasa-bayi/", heading: /Kalkulator Bahasa Bayi/i },
  { path: "/kuis-sesat-pikir/", heading: /Kuis Sesat Pikir/i },
  { path: "/kamus-sesat-pikir/", heading: /Kamus Sesat Pikir/i },
  { path: "/simulator/", heading: /Simulator Dampak Sosial/i },
  { path: "/tentang/", heading: /Tentang prototipe ini/i },
];

for (const { path, heading } of routes) {
  test(`${path} renders with heading and disclaimer`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
    await expect(page.getByTestId("disclaimer")).toContainText("Tidak berafiliasi");
    await expect(page.locator("html")).toHaveAttribute("lang", "id");
  });
}

test("mobile layout has no horizontal scroll", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test("bottom nav links to each tool", async ({ page }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Navigasi alat" });
  await nav.getByRole("link", { name: "Kuis" }).click();
  await expect(page).toHaveURL(/\/kuis-sesat-pikir\/$/);
});
