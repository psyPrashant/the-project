import { test, expect } from '@playwright/test';

/**
 * End-to-end interaction smoke (story TSP-20 / TSP-22, reskinned for TSP-44).
 *
 * Logging, editing, deleting and filtering interactions now happen on the consolidated employee
 * profile via a modal and the embedded interactions section. Requires the Angular dev server,
 * backend, and Postgres to be running. Seeded demo account: admin@psybergate.com / password123.
 */
const SEED_EMAIL = 'admin@psybergate.com';
const SEED_PASSWORD = 'password123';

function uniqueNote(): string {
  return `E2E interaction smoke test note ${Date.now()}`;
}

async function login(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/login');
  await page.getByLabel('Email').fill(SEED_EMAIL);
  await page.getByLabel('Password').fill(SEED_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/people/);
}

async function openJaneDoeProfile(page: import('@playwright/test').Page): Promise<void> {
  await page.getByRole('link', { name: /jane doe/i }).click();
  await expect(page.getByRole('heading', { name: /jane doe/i })).toBeVisible();
}

function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

async function logInteraction(page: import('@playwright/test').Page, note: string, type = 'NOTE'): Promise<void> {
  await page.getByRole('button', { name: 'Log interaction' }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('heading', { name: 'Log interaction' })).toBeVisible();
  await dialog.getByLabel('Type').selectOption(type);
  await dialog.getByLabel('Date').fill(todayIso());
  await dialog.getByLabel('Note').fill(note);
  await dialog.getByRole('button', { name: 'Save interaction' }).click();
}

test.describe('Interaction logging', () => {
  test('logs an interaction and shows it in the timeline', async ({ page }) => {
    await login(page);
    await page.goto('/people');
    await openJaneDoeProfile(page);

    const noteText = uniqueNote();
    await logInteraction(page, noteText);

    const item = page.locator('app-interactions-section li', { hasText: noteText });
    await expect(item).toBeVisible();
    await expect(item.getByText('Note', { exact: true })).toBeVisible();
  });

  test('shows a validation error when the note is empty', async ({ page }) => {
    await login(page);
    await page.goto('/people');
    await openJaneDoeProfile(page);

    await page.getByRole('button', { name: 'Log interaction' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Log interaction' })).toBeVisible();
    await dialog.getByRole('button', { name: 'Save interaction' }).click();

    await expect(dialog.getByText('A note is required.')).toBeVisible();
  });

  test('edits an existing own interaction', async ({ page }) => {
    await login(page);
    await page.goto('/people');
    await openJaneDoeProfile(page);

    const originalNote = uniqueNote();
    await logInteraction(page, originalNote);

    const item = page.locator('app-interactions-section li', { hasText: originalNote });
    await expect(item).toBeVisible();
    await item.getByRole('button', { name: /edit interaction/i }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog.getByRole('heading', { name: 'Edit interaction' })).toBeVisible();
    const updatedNote = `${originalNote} (edited)`;
    await dialog.getByLabel('Note').fill(updatedNote);
    await dialog.getByLabel('Type').selectOption('CALL');
    await dialog.getByRole('button', { name: 'Save interaction' }).click();

    const updatedItem = page.locator('app-interactions-section li', { hasText: updatedNote });
    await expect(updatedItem).toBeVisible();
    await expect(updatedItem.getByText('Call', { exact: true })).toBeVisible();
  });

  test('deletes an existing own interaction', async ({ page }) => {
    await login(page);
    await page.goto('/people');
    await openJaneDoeProfile(page);

    const noteText = uniqueNote();
    await logInteraction(page, noteText);

    const item = page.locator('app-interactions-section li', { hasText: noteText });
    await expect(item).toBeVisible();

    page.on('dialog', dialog => dialog.accept());
    await item.getByRole('button', { name: /delete interaction/i }).click();

    await expect(item).not.toBeVisible();
  });
});

test.describe('Interaction filtering', () => {
  test('filters the timeline by type', async ({ page }) => {
    await login(page);
    await page.goto('/people');
    await openJaneDoeProfile(page);

    const noteText = uniqueNote();
    await logInteraction(page, `${noteText} NOTE`, 'NOTE');
    await logInteraction(page, `${noteText} CALL`, 'CALL');

    const noteItem = page.locator('app-interactions-section li', { hasText: `${noteText} NOTE` });
    const callItem = page.locator('app-interactions-section li', { hasText: `${noteText} CALL` });
    await expect(noteItem).toBeVisible();
    await expect(callItem).toBeVisible();

    // Filters apply reactively on change — no Apply button.
    const filter = page.locator('form[aria-label="Filter interactions"]');
    await filter.getByLabel('Type').selectOption({ label: 'Call' });

    await expect(callItem).toBeVisible();
    await expect(noteItem).not.toBeVisible();

    await page.getByRole('button', { name: 'Clear' }).click();
    await expect(noteItem).toBeVisible();
    await expect(callItem).toBeVisible();
  });
});
