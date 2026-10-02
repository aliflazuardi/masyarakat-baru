import { expect, test, type Page } from "@playwright/test";

async function playToEnd(page: Page) {
  for (let i = 0; i < 15; i++) {
    if (await page.getByTestId("ending-title").isVisible()) return;
    await page
      .getByRole("group", { name: "Apa yang kamu lakukan?" })
      .locator("button:enabled")
      .first()
      .click();
  }
  throw new Error("did not reach an ending");
}

test("picker lists both scenarios", async ({ page }) => {
  await page.goto("/simulator/");
  await expect(page.getByRole("link", { name: /18 Tahun di Rantau Bakula/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Tambang di Desa Kami/ })).toBeVisible();
});

for (const slug of ["rantau-bakula", "tambang"]) {
  test(`${slug}: play to an ending, resume after reload, then replay`, async ({ page }) => {
    await page.goto(`/simulator/${slug}/`);
    await expect(page.getByText(/fiktif/)).toBeVisible();
    await page.getByRole("button", { name: "Mulai simulasi" }).click();
    await playToEnd(page);

    const ending = await page.getByTestId("ending-title").textContent();
    await expect(page.getByRole("heading", { name: "Kisah aslinya" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Ambil tindakan" })).toBeVisible();

    await page.reload();
    await expect(page.getByTestId("ending-title")).toHaveText(ending!);

    await page.getByRole("button", { name: "Main lagi dengan pilihan berbeda" }).click();
    await expect(page.getByRole("button", { name: "Mulai simulasi" })).toBeVisible();
  });
}

test("locked choices explain why", async ({ page }) => {
  await page.goto("/simulator/rantau-bakula/");
  await page.getByRole("button", { name: "Mulai simulasi" }).click();
  await page.getByRole("button", { name: /Ajak tetangga/ }).click();
  const sewa = page.getByRole("button", { name: /Sewa pengacara sendiri/ });
  await expect(sewa).toBeDisabled();
  await expect(sewa).toContainText("Biaya pengacara");
});

test("unknown scenario 404s", async ({ page }) => {
  const res = await page.goto("/simulator/tidak-ada/");
  expect(res?.status()).toBe(404);
});
