import { test, expect } from '@playwright/test';

/**
 * End-to-end portfolio smoke tests (Epic 4, TSP-5; reskinned for TSP-44).
 *
 * The portfolio now lives on the consolidated employee profile (`/people/:id`). Assumes the same
 * seeded demo account and running services as app.spec.ts.
 */
const SEED_EMAIL = 'admin@psybergate.com';
const SEED_PASSWORD = 'password123';

async function login(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/login');
  await page.locator('#email').fill(SEED_EMAIL);
  await page.locator('#password').fill(SEED_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/people/);
}

test.describe('Portfolio', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('renders the portfolio sections on the profile', async ({ page }) => {
    await page.goto('/people/1');

    await expect(page.getByRole('heading', { name: 'Education' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Public links' })).toBeVisible();
  });

  test('adds and deletes an education entry', async ({ page }) => {
    await page.goto('/people/1');

    const qualification = `BSc Playwright ${Date.now()}`;
    const section = page.locator('app-education-section');

    await section.getByRole('button', { name: /^add$/i }).click();
    await section.getByLabel('Institution').fill('Test University');
    await section.getByLabel('Qualification').fill(qualification);
    await section.getByRole('button', { name: /^save$/i }).click();

    await expect(section.getByText(qualification)).toBeVisible();

    await section.locator('li', { hasText: qualification }).getByRole('button', { name: /^delete$/i }).click();
    await expect(section.getByText(qualification)).toBeHidden();
  });

  test('shows validation errors for invalid education years', async ({ page }) => {
    await page.goto('/people/1');

    const section = page.locator('app-education-section');
    await section.getByRole('button', { name: /^add$/i }).click();
    await section.getByLabel('Institution').fill('Test University');
    await section.getByLabel('Qualification').fill('BSc');
    await section.getByLabel('Start year').fill('2025');
    await section.getByLabel('End year').fill('2020');
    await section.getByRole('button', { name: /^save$/i }).click();

    await expect(page.getByText(/startYear must be before or equal to endYear/i)).toBeVisible();
  });
});
