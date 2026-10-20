import { expect, test } from "@playwright/test";

test("big number tab: presets update per-person values", async ({ page }) => {
  await page.goto("/bahasa-bayi/");
  await expect(page.getByTestId("big-number")).toHaveText("Rp3.842,7 T");
  const before = await page.getByTestId("per-person-year").textContent();
  await page.getByRole("button", { name: "Makan Bergizi Gratis (MBG)" }).click();
  await expect(page.getByTestId("big-number")).toHaveText("Rp335,0 T");
  await expect(page.getByTestId("per-person-year")).not.toHaveText(before!);
});

test("tax tab: worked example matches the rules", async ({ page }) => {
  await page.goto("/bahasa-bayi/");
  await page.getByRole("tab", { name: "Ke Mana Pajakmu?" }).click();
  await page.getByLabel("Gaji kotor per bulan", { exact: true }).fill("10000000");
  // Rp10 juta/month, single, no dependents → PKP Rp60 juta → PPh Rp3 juta
  await expect(page.getByTestId("tax-pph")).toHaveText("Rp3.000.000");
});

test("reallocation tab: overspending breaches the deficit cap and can be shared", async ({
  page,
}) => {
  await page.goto("/bahasa-bayi/");
  await page.getByRole("tab", { name: "Jadi Menkeu Sehari" }).click();
  await expect(page.getByTestId("meter-deficit")).toHaveAttribute("data-status", "ok");
  const slider = page.getByLabel("Pertahanan", { exact: true });
  await slider.focus();
  await page.keyboard.press("End");
  await expect(page.getByTestId("meter-deficit")).toHaveAttribute("data-status", "bad");
  await page.getByRole("button", { name: "Bagikan skenarioku" }).click();
  await expect(page).toHaveURL(/tab=menkeu.*alokasi_pertahanan=/);
});

test("shared scenario link restores the tab and values", async ({ page }) => {
  await page.goto("/bahasa-bayi/?tab=menkeu&alokasi_pendidikan=230");
  await expect(page.getByRole("tab", { name: "Jadi Menkeu Sehari" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(page.getByTestId("meter-education")).toHaveAttribute("data-status", "bad");
});

test("debt interest is locked", async ({ page }) => {
  await page.goto("/bahasa-bayi/?tab=menkeu");
  await expect(page.locator("#slider-alokasi_bunga_utang")).toBeDisabled();
});

// On a mobile viewport an overflowing element zooms the whole page out instead of adding a
// scrollbar, so compare against the device width rather than clientWidth.
test("calculator fits a 360px phone on every tab, with the methodology open", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  const pageWidth = () => page.evaluate(() => document.documentElement.scrollWidth);
  for (const tab of ["angka", "pajak", "menkeu"]) {
    await page.goto(`/bahasa-bayi/?tab=${tab}`);
    expect(await pageWidth(), tab).toBeLessThanOrEqual(360);
  }
  await page.locator("#metodologi summary").click();
  expect(await pageWidth()).toBeLessThanOrEqual(360);
});

test("menkeu tab pins a deficit summary once the meters scroll away", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto("/bahasa-bayi/?tab=menkeu");
  await expect(page.getByTestId("sticky-summary")).toHaveCount(0);
  await page.getByLabel("Transfer ke daerah (TKD)", { exact: true }).scrollIntoViewIfNeeded();
  await expect(page.getByTestId("sticky-summary")).toBeVisible();
  await expect(page.getByTestId("sticky-summary")).toContainText("Defisit");
});
