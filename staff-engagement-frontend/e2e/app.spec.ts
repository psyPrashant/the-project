import { test, expect } from '@playwright/test';

/**
 * End-to-end smoke test (story F2).
 *
 * Proves the frontend builds, serves, and renders the root component in a real
 * browser — the minimum bar before any feature work layers on top.
 */
test('app loads and renders the heading', async ({ page }) => {
  await page.goto('/');

  await expect(page.locator('h1')).toContainText('Hello, staff-engagement-frontend');
});