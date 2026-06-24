import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the Staff Engagement frontend (story F2).
 *
 * The e2e smoke test boots the Angular dev server (`ng serve`) on port 4200 and
 * drives a real browser against it. In CI a fresh server is started; locally an
 * already-running `ng serve` is reused so `npm run e2e` is fast during dev.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'list',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    baseURL: 'http://localhost:4200',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'ng serve',
    url: 'http://localhost:4200',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});