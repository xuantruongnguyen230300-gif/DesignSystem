import { defineConfig, devices } from '@playwright/test';

/**
 * Accessibility + behaviour tests against the *built* docs site (every example is a fixture).
 * Run: npm run build && npm run test:a11y
 */
export default defineConfig({
  testDir: 'apps/docs/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: 'http://localhost:4300',
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'node tools/docs/serve-static.mjs dist/docs/browser 4300',
    url: 'http://localhost:4300',
    reuseExistingServer: !process.env['CI'],
  },
});
