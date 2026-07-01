import { test, expect } from '@playwright/test';

/**
 * End-to-end auth + shell smoke (story F6, TSP-44 reskin).
 *
 * Drives a real browser through the login flow and the app shell. Requires both the Angular dev
 * server (`ng serve`, started by Playwright's webServer) and the backend + Postgres to be running
 * so /api/auth/login resolves. Seeded demo account: admin@psybergate.com / password123.
 *
 * Locally: `docker compose up -d db`, `./mvnw spring-boot:run`, then `npm run e2e`.
 */
const SEED_EMAIL = 'admin@psybergate.com';
const SEED_PASSWORD = 'password123';

test('login page renders and is accessible', async ({ page }) => {
  await page.goto('/login');

  await expect(page.locator('h1')).toContainText('Engage');
  await expect(page.locator('#email')).toBeVisible();
  await expect(page.locator('#password')).toBeVisible();
});

test('valid credentials redirect to the People screen', async ({ page }) => {
  await page.goto('/login');
  await page.locator('#email').fill(SEED_EMAIL);
  await page.locator('#password').fill(SEED_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/people/);
  await expect(page.getByRole('heading', { name: 'People', exact: true })).toBeVisible();
});

test('invalid credentials show an error and stay on /login', async ({ page }) => {
  await page.goto('/login');
  await page.locator('#email').fill(SEED_EMAIL);
  await page.locator('#password').fill('wrong-password');
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('alert')).toContainText(/invalid email or password/i);
});

test('unauthenticated visit to a protected screen redirects to /login', async ({ page }) => {
  await page.addInitScript(() => window.localStorage.removeItem('se_token'));
  await page.goto('/people');

  await expect(page).toHaveURL(/\/login/);
});

test('the shell navigates and shows coming-soon placeholders', async ({ page }) => {
  await page.goto('/login');
  await page.locator('#email').fill(SEED_EMAIL);
  await page.locator('#password').fill(SEED_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/people/);

  // The signed-in user and Sign out control live in the sidebar.
  await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();

  await page.getByRole('link', { name: 'My Dashboard' }).click();
  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole('heading', { name: 'My Dashboard' })).toBeVisible();
  await expect(page.getByText('Total employees')).toBeVisible();

  await page.getByLabel('Primary').getByRole('link', { name: 'Skills Register' }).click();
  await expect(page).toHaveURL(/\/skills/);
  await expect(page.getByRole('heading', { name: 'Skills Register' })).toBeVisible();

  await page.getByRole('link', { name: 'My Tasks' }).click();
  await expect(page).toHaveURL(/\/tasks/);
  await expect(page.getByRole('heading', { name: 'My Tasks' })).toBeVisible();
});
