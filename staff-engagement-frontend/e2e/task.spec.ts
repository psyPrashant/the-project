import { test, expect } from '@playwright/test';

const ADMIN_EMAIL = 'admin@psybergate.com';
const ADMIN_PASSWORD = 'password123';

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login');
  await page.getByLabel('Email').fill(ADMIN_EMAIL);
  await page.getByLabel('Password').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/people');
}

test.describe('Task management', () => {
  test('create a standalone task and view it on My Tasks page', async ({ page }) => {
    await login(page);

    // Navigate to My Tasks via sidebar
    await page.getByRole('link', { name: 'My Tasks' }).click();
    await page.waitForURL('**/tasks');

    // Create a new standalone task
    await page.getByRole('link', { name: 'New task' }).click();
    await page.waitForURL('**/tasks/new');

    await page.getByLabel('Title').fill('E2E test task');
    const subjectSelect = page.getByLabel('Relates to');
    await subjectSelect.selectOption({ index: 1 });
    await page.getByRole('button', { name: 'Create task' }).click();

    // Redirects to My Tasks
    await page.waitForURL('**/tasks');
  });

  test('mark a task as done', async ({ page }) => {
    await login(page);

    const title = `Task to mark done ${Date.now()}`;

    await page.goto('/tasks/new');
    await page.getByLabel('Relates to').selectOption({ index: 1 });
    await page.getByLabel('Title').fill(title);
    await page.getByRole('button', { name: 'Create task' }).click();
    await page.waitForURL('**/tasks');

    await page.getByRole('button', { name: `Mark task done: ${title}` }).click();
    await expect(
      page.locator('section[aria-label="Done tasks"]').getByText(title)
    ).toBeVisible();
  });

  test('validation error when submitting task form with empty title', async ({ page }) => {
    await login(page);
    await page.goto('/tasks/new');

    const subjectSelect = page.getByLabel('Relates to');
    await subjectSelect.selectOption({ index: 1 });

    await page.getByRole('button', { name: 'Create task' }).click();
    await expect(page.getByText('Title is required')).toBeVisible();
  });
});
