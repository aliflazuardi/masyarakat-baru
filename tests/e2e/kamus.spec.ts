import { expect, test } from "@playwright/test";

test("search filters cards as you type", async ({ page }) => {
  await page.goto("/kamus-sesat-pikir/");
  const count = page.getByTestId("kamus-count");
  await expect(count).toHaveText("18 sesat pikir");
  await page.getByRole("searchbox", { name: "Cari sesat pikir" }).fill("lereng");
  await expect(count).toHaveText("1 sesat pikir");
  await expect(page.getByRole("button", { name: /Lereng Licin/ })).toBeVisible();
});

test("category chips filter and combine with search", async ({ page }) => {
  await page.goto("/kamus-sesat-pikir/");
  await page
    .getByRole("group", { name: "Filter kategori" })
    .getByRole("button", { name: "Serangan Personal" })
    .click();
  await expect(page.getByRole("button", { name: /Serangan Pribadi/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Lereng Licin/ })).toHaveCount(0);
});

test("deep link opens the card", async ({ page }) => {
  await page.goto("/kamus-sesat-pikir/#ad-hominem");
  const toggle = page.getByRole("button", { name: /Serangan Pribadi/ });
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("Cara Menanggapi").first()).toBeVisible();
});

test("clicking a card toggles it and updates the URL", async ({ page }) => {
  await page.goto("/kamus-sesat-pikir/");
  const toggle = page.getByRole("button", { name: /Dilema Palsu/ });
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page).toHaveURL(/#false-dilemma$/);
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});
