import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  reporter: "list",
  timeout: 90_000,
  use: {
    trace: "retain-on-failure",
  },
});
