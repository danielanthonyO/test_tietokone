import { Page, expect } from 'playwright/test';

export class CustomersPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/customers');
  }

  async expectPageLoaded() {
    await expect(this.page).toHaveURL(/customers/);
    await expect(this.page.getByRole('heading', { name: /customer/i })).toBeVisible();
  }

  async openCreateCustomerForm() {
    await this.page.getByRole('button', { name: /create new customer/i }).click();
    await expect(this.page.getByText(/add a new customer/i)).toBeVisible();
  }

  async createCustomer(name: string, email: string, phone: string) {
    await this.openCreateCustomerForm();
    await this.page.locator('input[name="name"]').fill(name);
    await this.page.locator('input[name="email"]').fill(email);
    await this.page.locator('input[name="phone"]').fill(phone);
    await this.page.getByRole('button', { name: /^add$/i }).click();
  }

  async search(text: string) {
    const searchInput = this.page.getByPlaceholder(/search customer/i);
    await searchInput.fill(text);
  }

  async expectCustomerVisible(name: string) {
    await expect(this.page.getByText(name)).toBeVisible();
  }

  async expandCustomer(name: string) {
    await this.page.getByText(name).click();
  }

  async openEditCustomer() {
    await this.page.getByRole('button', { name: /^edit$/i }).click();
  }

  async updatePhone(phone: string) {
    const phoneInput = this.page.locator('input[name="phone"]');
    await phoneInput.fill(phone);
    await this.page.getByRole('button', { name: /^save$/i }).click();
  }

  async expectPhoneVisible(phone: string) {
    await expect(this.page.getByText(phone)).toBeVisible();
  }

  async deleteCustomer() {
    await this.page.getByRole('button', { name: /^delete$/i }).click();
    await expect(this.page.getByText(/delete this customer from the system/i)).toBeVisible();
    await this.page.getByRole('button', { name: /^delete$/i }).last().click();
  }

  async expectEmptyState() {
    await expect(this.page.getByText(/no customers found/i)).toBeVisible();
  }
}
