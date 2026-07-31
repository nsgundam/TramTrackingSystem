import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  testMatch: "t8-route-switch.spec.ts",
  timeout: 30_000,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:13000",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: "node tests/t8-local-server.mjs",
      url: "http://127.0.0.1:13001/health",
      timeout: 30_000,
      reuseExistingServer: false,
    },
    {
      command: "NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:13001 NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:13001/api npm run dev -- --hostname 127.0.0.1 --port 13000",
      url: "http://127.0.0.1:13000",
      timeout: 30_000,
      reuseExistingServer: false,
    },
  ],
});
