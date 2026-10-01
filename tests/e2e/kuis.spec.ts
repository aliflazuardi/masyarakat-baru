import { expect, test } from "@playwright/test";

test("complete today's set, see the result, and keep it after reload", async ({ page }) => {
  await page.goto("/kuis-sesat-pikir/");
  for (let i = 1; i <= 3; i++) {
    await expect(page.getByText(`Soal ${i} dari 3`)).toBeVisible();
    // Pick the first option; the outcome doesn't matter for the flow.
    await page
      .getByRole("group", { name: "Sesat pikir apa yang dipakai?" })
      .getByRole("button")
      .first()
      .click();
    await expect(page.getByText(/Tepat!|Belum tepat\./)).toBeVisible();
    await page.getByRole("button", { name: i < 3 ? "Soal berikutnya" : "Lihat hasil" }).click();
  }

  await expect(page.getByTestId("quiz-score")).toHaveText(/[0-3]\/3/);
  await expect(page.getByTestId("quiz-streak")).toHaveText(/1 hari/);
  await expect(page.getByRole("button", { name: "Bagikan hasil" })).toBeVisible();

  // A finished set can't be replayed: reloading shows the same result.
  await page.reload();
  await expect(page.getByTestId("quiz-score")).toBeVisible();
  await expect(page.getByTestId("quiz-streak")).toHaveText(/1 hari/);
});

test("explanation links to the fallacy in the Kamus", async ({ page }) => {
  await page.goto("/kuis-sesat-pikir/");
  await page
    .getByRole("group", { name: "Sesat pikir apa yang dipakai?" })
    .getByRole("button")
    .first()
    .click();
  const link = page.getByRole("link", { name: /di Kamus/ });
  // Valid-argument questions have no Kamus link.
  if ((await link.count()) > 0) {
    await link.click();
    await expect(page).toHaveURL(/\/kamus-sesat-pikir\/#[a-z-]+$/);
    await expect(page.locator('[aria-expanded="true"]')).toHaveCount(1);
  }
});
