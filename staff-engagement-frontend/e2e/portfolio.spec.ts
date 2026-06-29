import { test, expect } from '@playwright/test';

/**
 * End-to-end portfolio smoke tests (Epic 4, TSP-5).
 *
 * Exercises the full stack for the new portfolio route. Assumes the same seeded
 * demo account and running services as app.spec.ts.
 */
const SEED_EMAIL = 'admin@psybergate.com';
const SEED_PASSWORD = 'password123';

async function login(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/login');
  await page.locator('#email').fill(SEED_EMAIL);
  await page.locator('#password').fill(SEED_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/home/);
}

test.describe('Portfolio', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('renders the portfolio page for an employee', async ({ page }) => {
    await page.goto('/employees/1/portfolio');

    await expect(page.getByRole('heading', { name: 'Portfolio' })).toBeVisible();
    await expect(page.getByRole('link', { name: /back to employee/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Education' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Showcase Links' })).toBeVisible();
  });

  test('adds and deletes an education entry', async ({ page }) => {
    await page.goto('/employees/1/portfolio');

    const qualification = `BSc Playwright ${Date.now()}`;

    await page.getByRole('button', { name: /add education/i }).click();
    await page.getByLabel('Institution').fill('Test University');
    await page.getByLabel('Qualification').fill(qualification);
    await page.getByRole('button', { name: /^save$/i }).click();

    await expect(page.getByText(qualification)).toBeVisible();

    await page.locator('li', { hasText: qualification }).getByRole('button', { name: /^delete$/i }).click();
    await expect(page.getByText(qualification)).toBeHidden();
  });

  test('shows validation errors for invalid education years', async ({ page }) => {
    await page.goto('/employees/1/portfolio');

    await page.getByRole('button', { name: /add education/i }).click();
    await page.getByLabel('Institution').fill('Test University');
    await page.getByLabel('Qualification').fill('BSc');
    await page.getByLabel('Start year').fill('2025');
    await page.getByLabel('End year').fill('2020');
    await page.getByRole('button', { name: /^save$/i }).click();

    await expect(page.getByText(/startYear must be before or equal to endYear/i)).toBeVisible();
  });
});
