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
