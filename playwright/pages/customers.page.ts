import { Page, expect } from '@playwright/test';

export class CustomersPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/customers');
  }

  async createCustomer(name: string) {
    await this.page.getByRole('button', { name: /add/i }).click();
    await this.page.getByPlaceholder('Name').fill(name);
    await this.page.getByRole('button', { name: /save/i }).click();
  }

  async expectCustomerVisible(name: string) {
    await expect(this.page.locator(`text=${name}`)).toBeVisible();
  }
}