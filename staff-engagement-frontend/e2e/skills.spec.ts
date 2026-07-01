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
    const skillsList = page.getByRole('list', { name: 'All skills' });
    await expect(skillsList.getByText('Java')).toBeVisible();
    await skillsList.getByText('Java').click();
    await expect(page.getByText('Jane Doe')).toBeVisible();
  });

  test('clicking All Skills clears search results', async ({ page }) => {
    await page.goto('/skills');
    const allSkillsButton = page.getByRole('button', { name: 'All Skills', exact: true });
    await expect(allSkillsButton).toBeVisible();

    const skillsList = page.getByRole('list', { name: 'All skills' });
    await skillsList.getByText('Java').click();
    await expect(page.getByText('Jane Doe')).toBeVisible();
    await allSkillsButton.click();
    await expect(page.getByText('Jane Doe')).not.toBeVisible();
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
    const section = page.locator('app-skill-section');
    await expect(section.getByRole('heading', { name: 'Skills' })).toBeVisible();
    await expect(section.getByRole('button', { name: /^add$/i })).toBeVisible();
  });

  test('adds a skill and it appears in the list', async ({ page }) => {
    await page.goto('/people/1');
    const section = page.locator('app-skill-section');
    // admin (person 1) is seeded with Docker/AWS/SQL, so use a skill they lack.
    await section.getByRole('button', { name: /^add$/i }).click();
    await section.getByLabel('Skill name').fill('Python');
    await section.getByLabel('Years of experience').fill('2');
    await section.getByRole('button', { name: /^save$/i }).click();
    await expect(section.getByText('Python')).toBeVisible();
    // Clean up — remove the skill so the test is idempotent
    await section.getByRole('button', { name: 'Delete Python' }).click();
    await expect(section.getByRole('listitem').filter({ hasText: 'Python' })).toHaveCount(0);
  });

  test('shows validation error when skill name is missing', async ({ page }) => {
    await page.goto('/people/1');
    const section = page.locator('app-skill-section');
    await section.getByRole('button', { name: /^add$/i }).click();
    await section.getByRole('button', { name: /^save$/i }).click();
    await expect(section.getByText(/skill name is required/i)).toBeVisible();
  });
});
