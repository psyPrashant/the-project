import { test, expect } from '@playwright/test';

const SEED_EMAIL = 'admin@psybergate.com';
const SEED_PASSWORD = 'password123';

async function login(page: import('@playwright/test').Page): Promise<void> {
  await page.goto('/login');
  await page.locator('#email').fill(SEED_EMAIL);
  await page.locator('#password').fill(SEED_PASSWORD);
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/people/);
}

test.describe('Skills Register', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('shows browseable list of all canonical skills', async ({ page }) => {
    await page.goto('/skills');
    await expect(page.getByRole('heading', { name: 'Skills Register' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'All Skills' })).toBeVisible();
    const skillsList = page.getByRole('list', { name: 'All skills' });
    await expect(skillsList.getByText('Angular')).toBeVisible();
    await expect(skillsList.getByText('Java')).toBeVisible();
    await expect(skillsList.getByText('Spring Boot')).toBeVisible();
  });

  test('searching by skill shows ranked employee results', async ({ page }) => {
    await page.goto('/skills');
    const select = page.getByLabel('Select a skill');
    await expect(select).toBeVisible();
    await select.selectOption({ label: 'Angular' });
    await expect(page.getByText('Jane Doe')).toBeVisible();
  });

  test('selecting the default option clears search results', async ({ page }) => {
    await page.goto('/skills');
    await page.getByLabel('Select a skill').selectOption({ label: 'Angular' });
    await expect(page.getByText('Jane Doe')).toBeVisible();
    await page.getByLabel('Select a skill').selectOption({ value: '' });
    await expect(page.getByText('Jane Doe')).not.toBeVisible();
  });

  test('Home link navigates back', async ({ page }) => {
    await page.goto('/skills');
    await page.getByRole('link', { name: 'Home' }).click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('Skills Register link appears on the home page', async ({ page }) => {
    await expect(page.getByRole('link', { name: /skills register/i })).toBeVisible();
  });
});

test.describe('Portfolio — Skills section', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('portfolio page shows a Skills section', async ({ page }) => {
    await page.goto('/people/1');
    await expect(page.getByRole('heading', { name: 'Skills' })).toBeVisible();
    await expect(page.getByRole('button', { name: /add skill/i })).toBeVisible();
  });

  test('adds a skill and it appears in the list', async ({ page }) => {
    await page.goto('/people/1');
    await page.getByRole('button', { name: /add skill/i }).click();
    await page.getByLabel('Skill Name').fill('SQL');
    await page.getByLabel('Years of Experience').fill('2');
    await page.getByRole('button', { name: /^save$/i }).click();
    await expect(page.getByText('SQL')).toBeVisible();
    // Clean up — remove the skill so the test is idempotent
    await page.getByRole('button', { name: 'Delete SQL' }).click();
    await expect(page.getByRole('listitem').filter({ hasText: 'SQL' })).toHaveCount(0);
  });

  test('shows validation error when skill name is missing', async ({ page }) => {
    await page.goto('/people/1');
    await page.getByRole('button', { name: /add skill/i }).click();
    await page.getByRole('button', { name: /^save$/i }).click();
    await expect(page.getByText(/skill name is required/i)).toBeVisible();
  });
});
