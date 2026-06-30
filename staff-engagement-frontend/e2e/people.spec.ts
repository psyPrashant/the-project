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
  await page.getByLabel(/first name/i).fill(firstName);
  await page.getByLabel(/last name/i).fill(lastName);
  await page.getByLabel(/email/i).fill(email);
  await page.getByRole('dialog').getByRole('button', { name: 'Add employee' }).click();
  await expect(page.getByRole('heading', { name: `${firstName} ${lastName}` })).toBeVisible();
}

test.describe('People — Show archived toggle', () => {
  test('Show archived toggle is off by default', async ({ page }) => {
    await login(page);
    await page.goto('/people');

    const toggle = page.locator('#show-archived');
    await expect(toggle).not.toBeChecked();
  });

  test('Turning on Show archived reveals archived employees with Archived badge', async ({ page }) => {
    await login(page);

    const unique = `toggle-${Date.now()}`;
    await createEmployee(page, 'ToggleTest', 'Person', `${unique}@example.com`);

    await page.getByRole('button', { name: 'Archive', exact: true }).click();
    await expect(page.getByText('Archived', { exact: true })).toBeVisible();

    await page.getByRole('link', { name: 'People' }).first().click();
    await expect(page).toHaveURL(/\/people/);

    await expect(page.getByText('ToggleTest Person')).not.toBeVisible();

    await page.locator('#show-archived').check();
    await expect(page.getByText('ToggleTest Person')).toBeVisible();

    const archivedCard = page.locator('ul li').filter({ hasText: 'ToggleTest Person' });
    await expect(archivedCard.getByText('Archived', { exact: true })).toBeVisible();
  });
});

test.describe('People — Unarchive employee', () => {
  test('Archive then unarchive restores the employee profile in place', async ({ page }) => {
    await login(page);

    const unique = `unarchive-${Date.now()}`;
    await createEmployee(page, 'UnarchiveTest', 'Person', `${unique}@example.com`);

    await page.getByRole('button', { name: 'Archive', exact: true }).click();
    await expect(page.getByText('Archived', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Archive', exact: true })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Unarchive', exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Unarchive', exact: true }).click();

    await expect(page.getByText('Archived', { exact: true })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Archive', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Unarchive', exact: true })).not.toBeVisible();
    await expect(page).toHaveURL(/\/people\/\d+/);
  });

  test('After unarchive, employee reappears in People list without Show archived toggle', async ({ page }) => {
    await login(page);

    const unique = `relist-${Date.now()}`;
    await createEmployee(page, 'RelistTest', 'Person', `${unique}@example.com`);

    await page.getByRole('button', { name: 'Archive', exact: true }).click();
    await expect(page.getByText('Archived', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Unarchive', exact: true }).click();
    await expect(page.getByText('Archived', { exact: true })).not.toBeVisible();

    await page.getByRole('link', { name: 'People' }).first().click();
    await expect(page).toHaveURL(/\/people/);
    await expect(page.getByText('RelistTest Person')).toBeVisible();
  });
});
