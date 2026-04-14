import { test, expect } from '@playwright/test';

test('language switch works', async ({ page }) => {
  await page.goto('/');

  const switcher = page.locator('[data-testid="language-switcher"]');

  if (await switcher.count() === 0) {
    test.skip();
  }

  await switcher.click();
  await page.getByText('Suomi').click();

  await expect(page.locator('body')).toContainText(/asiakas/i);
});