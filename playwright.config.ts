import { defineConfig, devices } from "@playwright/test";

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !isCI,
    env: {
      APP_BASE_URL: "http://localhost:3000",
      AUTH0_DOMAIN: "example.us.auth0.com",
      AUTH0_CLIENT_ID: "e2e-client-id",
      AUTH0_CLIENT_SECRET: "e2e-client-secret",
      AUTH0_SECRET: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      NEXT_PUBLIC_API_BASE_URL: "http://127.0.0.1:8080",
      NEXT_PUBLIC_API_BASE_PATH: "/api/v1",
      PROFILE_API_STUB: "true",
    },
    timeout: 120 * 1000,
  },
});
