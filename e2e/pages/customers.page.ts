import { Page, expect } from '@playwright/test';

export class CustomersPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/customers');
  }

  async expectPageLoaded() {
    await expect(this.page).toHaveURL(/customers/);
    await expect(
      this.page.getByRole('heading', { name: /customer/i }),
    ).toBeVisible();
  }

  async openCreateCustomerForm() {
    await this.page
      .getByRole('button', { name: /create new customer/i })
      .click();

    await expect(this.page.getByText(/add a new customer/i)).toBeVisible();
  }

  async createCustomer(name: string, email: string, phone: string) {
    await this.openCreateCustomerForm();

    await this.page.locator('input[name="name"]').fill(name);
    await this.page.locator('input[name="email"]').fill(email);
    await this.page.locator('input[name="phone"]').fill(phone);

    await this.page.getByRole('button', { name: /^add$/i }).click();

    await expect(this.page.getByText(/add a new customer/i)).not.toBeVisible();
    await expect(this.page.getByText(name, { exact: true })).toBeVisible();
  }

  async search(text: string) {
    await this.page.getByPlaceholder(/search customer/i).fill(text);
  }

  async expectCustomerVisible(name: string) {
    await expect(this.page.getByText(name, { exact: true })).toBeVisible();
  }

  async expectCustomerNotVisible(name: string) {
    await expect(this.page.getByText(name, { exact: true })).not.toBeVisible();
  }

  async expandCustomer(name: string) {
    await this.page.getByText(name, { exact: true }).click();
  }

  async openDeleteCustomer() {
    await this.page.getByRole('button', { name: /^delete$/i }).click();
    await expect(
      this.page.getByText(/delete this customer from the system/i),
    ).toBeVisible();
  }

  async confirmDeleteCustomer() {
    await this.page.getByRole('button', { name: /^delete$/i }).last().click();
  }

  async deleteCustomer() {
    await this.openDeleteCustomer();
    await this.confirmDeleteCustomer();
  }

  async expectEmptyState() {
    await expect(this.page.getByText(/no customers found/i)).toBeVisible();
  }
}