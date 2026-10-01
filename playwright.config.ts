import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  // Mobile-first: the audience is mostly on phones.
  projects: [{ name: "mobile-chrome", use: { ...devices["Pixel 7"] } }],
  // Serve the static export (run `npm run build` first), so tests hit exactly what ships.
  webServer: {
    command: `node scripts/serve-static.mjs out ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
});
