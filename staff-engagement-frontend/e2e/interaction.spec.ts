import { test, expect } from '@playwright/test';

/**
 * End-to-end interaction smoke (story TSP-20).
 *
 * Drives a real browser through logging an interaction against a seeded employee
 * and viewing it on the employee timeline. Requires the Angular dev server, backend,
 * and Postgres to be running. Seeded demo account: admin@psybergate.com / password123.
 */
const SEED_EMAIL = 'admin@psybergate.com';
const SEED_PASSWORD = 'password123';

async function login(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email').fill(SEED_EMAIL);
  await page.getByLabel('Password').fill(SEED_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/home/);
}

function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

test.describe('Interaction logging', () => {
  test('logs an interaction against a seeded employee and shows it on the timeline', async ({ page }) => {
    await login(page);

    await page.goto('/employees');
    await expect(page.getByRole('heading', { name: 'Employees' })).toBeVisible();

    await page.getByRole('link', { name: /jane doe/i }).click();

    await expect(page.getByRole('heading', { name: /jane doe/i })).toBeVisible();
    await page.getByRole('link', { name: /log/i }).click();

    await expect(page.getByRole('heading', { name: 'Log Interaction' })).toBeVisible();

    const subjectSelect = page.locator('#subjectId');
    await expect(subjectSelect).toBeDisabled();

    await page.getByLabel('Type').selectOption('NOTE');
    await page.getByLabel('Date').fill(todayIso());
    await page.getByLabel('Note').fill('E2E interaction smoke test note');

    await page.getByRole('button', { name: /log interaction/i }).click();

    await expect(page).toHaveURL(/\/employees\/\d+\/interactions/);
    await expect(page.getByText('E2E interaction smoke test note')).toBeVisible();
    await expect(page.getByText('NOTE')).toBeVisible();
    await expect(page.getByText(/logged by admin user/i)).toBeVisible();
  });

  test('shows validation errors when required fields are empty', async ({ page }) => {
    await login(page);

    await page.goto('/interactions/new');
    await expect(page.getByRole('heading', { name: 'Log Interaction' })).toBeVisible();

    await page.getByRole('button', { name: /log interaction/i }).click();

    await expect(page.getByRole('alert')).toContainText(/subject is required/i);
    await expect(page.getByRole('alert')).toContainText(/note is required/i);
    await expect(page.getByRole('alert')).toContainText(/date is required/i);
  });
});
