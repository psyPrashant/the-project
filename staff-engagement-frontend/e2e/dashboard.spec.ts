import { test, expect, Page } from '@playwright/test';

/**
 * Dashboard smoke tests (TSP-53). Assumes a seeded demo employee exists and the backend is
 * running so /api/dashboard returns an aggregate response. Playwright's webServer handles the
 * Angular dev server.
 */
const SEED_EMAIL = 'admin@psybergate.com';
const SEED_PASSWORD = 'password123';

async function signIn(page: Page): Promise<void> {
  await page.goto('/login');
  await page.locator('#email').fill(SEED_EMAIL);
  await page.locator('#password').fill(SEED_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/people/);
}

test('dashboard loads with pulse tiles and sections after login', async ({ page }) => {
  await signIn(page);
  await page.goto('/dashboard');

  await expect(page.getByRole('heading', { name: 'My Dashboard', exact: true })).toBeVisible();
  await expect(page.getByText('Total employees')).toBeVisible();
  await expect(page.getByText('Employees with skills')).toBeVisible();
  await expect(page.getByText('Open tasks')).toBeVisible();
  await expect(page.getByText('Interactions this week')).toBeVisible();

  await expect(page.getByRole('heading', { name: 'Action needed' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Recent activity' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Skill coverage' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Me' })).toBeVisible();
});

test('dashboard activity filter changes the visible feed', async ({ page }) => {
  await signIn(page);
  await page.goto('/dashboard');

  await expect(page.getByRole('heading', { name: 'Recent activity' })).toBeVisible();

  // The "All" filter should be pressed by default.
  const allButton = page.getByRole('button', { name: 'All', exact: true });
  await expect(allButton).toHaveAttribute('aria-pressed', 'true');

  // Switch to a filter that may match nothing; the empty message is shown.
  await page.getByRole('button', { name: 'People', exact: true }).click();
  await expect(page.getByText('No recent activity matches this filter.')).toBeVisible();
});
