import { expect, test } from "@playwright/test";

test("landing page shows the pitch and every tool card links to a live tool", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/");
  const tools = page.locator("#alat");
  await expect(tools.getByRole("link")).toHaveCount(3);
  for (const href of ["/bahasa-bayi/", "/kuis-sesat-pikir/", "/simulator/"]) {
    await expect(tools.locator(`a[href$="${href}"]`)).toBeVisible();
  }
  await expect(page.getByRole("heading", { name: "Matriks Aktivasi" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Peta Jalan Enam Bulan" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Arsitektur" })).toBeVisible();
});

test("tentang lists data sources and the disclaimer", async ({ page }) => {
  await page.goto("/tentang/");
  await expect(page.getByRole("heading", { name: "Sumber data kalkulator" })).toBeVisible();
  await expect(page.getByTestId("about-disclaimer")).toContainText("Tidak berafiliasi");
});
