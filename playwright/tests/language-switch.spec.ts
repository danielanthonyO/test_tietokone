import { test, expect } from '@playwright/test';

test('language can be changed when switcher exists', async ({ page }) => {
  await page.goto('/');

  const switcher = page.locator('[data-testid="language-switcher"]');

  test.skip(await switcher.count() === 0, 'Language switcher is not present in UI yet');

  await switcher.click();

  const finnishOption = page.getByText(/suomi/i);
  await expect(finnishOption).toBeVisible();
  await finnishOption.click();

  await expect(page.locator('body')).toContainText(/asiakas|tilaus|etu­sivu/i);
});