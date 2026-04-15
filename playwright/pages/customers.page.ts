import { Page, expect } from '@playwright/test';

export class CustomersPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/customers');
  }

  async expectPageLoaded() {
    await expect(this.page).toHaveURL(/customers/);
  }

  async openCreateCustomerForm() {
    const addButton = this.page.getByRole('button', { name: /add|create|new/i });
    await expect(addButton).toBeVisible();
    await addButton.click();
  }

  async fillCustomerName(name: string) {
    const nameInput = this.page.getByPlaceholder(/name/i).or(
      this.page.locator('input[name="name"]')
    );
    await expect(nameInput).toBeVisible();
    await nameInput.fill(name);
  }

  async saveCustomer() {
    const saveButton = this.page.getByRole('button', { name: /save|submit|create/i });
    await expect(saveButton).toBeVisible();
    await saveButton.click();
  }

  async expectCustomerVisible(name: string) {
    await expect(this.page.getByText(name)).toBeVisible();
  }
}