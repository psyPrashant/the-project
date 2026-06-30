import { test, expect } from '@playwright/test';

const SEED_EMAIL = 'admin@psybergate.com';
const SEED_PASSWORD = 'password123';

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.locator('#email').fill(SEED_EMAIL);
  await page.locator('#password').fill(SEED_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/people/);
}

async function createEmployee(page: import('@playwright/test').Page, firstName: string, lastName: string, email: string) {
  await page.getByRole('button', { name: 'Add employee' }).click();
  await page.getByLabel('First Name').fill(firstName);
  await page.getByLabel('Last Name').fill(lastName);
  await page.getByLabel('Email').fill(email);
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('heading', { name: `${firstName} ${lastName}` })).toBeVisible();
}

test.describe('People — Show archived toggle', () => {
  test('Show archived toggle is off by default and hides archived employees', async ({ page }) => {
    await login(page);
    await page.goto('/people');

    const toggle = page.locator('#show-archived');
    await expect(toggle).not.toBeChecked();
    await expect(page.getByText('Archived')).not.toBeVisible();
  });

  test('Turning on Show archived reveals archived employees with Archived badge', async ({ page }) => {
    await login(page);

    const unique = `archived-toggle-${Date.now()}`;
    await createEmployee(page, 'ToggleTest', 'Archived', `${unique}@example.com`);

    await page.getByRole('button', { name: 'Archive' }).click();
    await expect(page.getByText('Archived')).toBeVisible();

    await page.getByRole('link', { name: 'People' }).first().click();
    await expect(page).toHaveURL(/\/people/);

    await expect(page.getByText('ToggleTest Archived')).not.toBeVisible();

    await page.locator('#show-archived').check();
    await expect(page.getByText('ToggleTest Archived')).toBeVisible();
    const cards = page.locator('ul li');
    const archivedCard = cards.filter({ hasText: 'ToggleTest Archived' });
    await expect(archivedCard.getByText('Archived')).toBeVisible();
  });
});

test.describe('People — Unarchive employee', () => {
  test('Archive then unarchive restores the employee profile in place', async ({ page }) => {
    await login(page);

    const unique = `unarchive-${Date.now()}`;
    await createEmployee(page, 'Unarchive', 'Me', `${unique}@example.com`);

    await page.getByRole('button', { name: 'Archive' }).click();
    await expect(page.getByText('Archived')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Archive' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Unarchive' })).toBeVisible();

    await page.getByRole('button', { name: 'Unarchive' }).click();

    await expect(page.getByText('Archived')).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Archive' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Unarchive' })).not.toBeVisible();
    await expect(page).toHaveURL(/\/people\/\d+/);
  });

  test('After unarchive, employee reappears in People list without Show archived toggle', async ({ page }) => {
    await login(page);

    const unique = `unarchive-list-${Date.now()}`;
    await createEmployee(page, 'RelistTest', 'Employee', `${unique}@example.com`);
    const profileUrl = page.url();

    await page.getByRole('button', { name: 'Archive' }).click();
    await expect(page.getByText('Archived')).toBeVisible();
    await page.getByRole('button', { name: 'Unarchive' }).click();
    await expect(page.getByText('Archived')).not.toBeVisible();

    await page.getByRole('link', { name: 'People' }).first().click();
    await expect(page).toHaveURL(/\/people/);
    await expect(page.getByText('RelistTest Employee')).toBeVisible();
    void profileUrl;
  });
});
