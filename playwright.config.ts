import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  use: { baseURL: 'http://127.0.0.1:3000', trace: 'on-first-retry', launchOptions: { executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome' } },
  webServer: { command: './node_modules/.bin/next dev -p 3000', url: 'http://127.0.0.1:3000/vi', reuseExistingServer: true, timeout: 120_000 },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
