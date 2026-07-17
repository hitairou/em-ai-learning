import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PRODUCTION_E2E_BASE_URL ?? "https://edesign.tairoh.com";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "production-session.spec.ts",
  fullyParallel: false,
  workers: 1,
  reporter: "list",
  timeout: 8 * 60_000,
  expect: { timeout: 15_000 },
  use: {
    baseURL,
    trace: "off",
    screenshot: "off",
    video: "off",
  },
  projects: [
    {
      name: "firefox-desktop",
      use: {
        ...devices["Desktop Firefox"],
        viewport: { width: 1440, height: 900 },
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:140.0) Gecko/20100101 Firefox/140.0",
      },
    },
    {
      name: "chromium-desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      },
    },
    {
      name: "webkit-mobile",
      use: {
        ...devices["iPhone 15"],
      },
    },
  ],
});
