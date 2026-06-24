import { test, expect } from '@playwright/test';

/**
 * End-to-end auth smoke (story F6).
 *
 * Drives a real browser through the login flow. Requires both the Angular dev server
 * (`ng serve`, started by Playwright's webServer) and the backend + Postgres to be running
 * so /api/auth/login resolves. Seeded demo account: admin@psybergate.com / password123.
 *
 * CI runs only Vitest (`npm test`); this e2e is run locally with the full stack up.
 */
const SEED_EMAIL = 'admin@psybergate.com';
const SEED_PASSWORD = 'password123';

test('login page renders and is accessible', async ({ page }) => {
  await page.goto('/login');

  await expect(page.locator('h1')).toContainText('Staff Engagement');
  await expect(page.locator('#email')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();
});

test('valid credentials redirect to /home with a welcome', async ({ page }) => {
  await page.goto('/login');
  await page.locator('#email').fill(SEED_EMAIL);
  await page.locator('#password').fill(SEED_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/home/);
  await expect(page.locator('h1')).toContainText('Welcome, Admin');
});

test('invalid credentials show an error and stay on /login', async ({ page }) => {
  await page.goto('/login');
  await page.locator('#email').fill(SEED_EMAIL);
  await page.locator('#password').fill('wrong-password');
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('alert')).toContainText(/invalid email or password/i);
});

test('unauthenticated visit to /home redirects to /login', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.removeItem('se_token'));
  await page.goto('/home');

  await expect(page).toHaveURL(/\/login/);
});