import { test as base } from '@playwright/test';
import { CustomersPage } from '../pages/customers.page';

export const test = base.extend<{
  customersPage: CustomersPage;
}>({
  customersPage: async ({ page }, use) => {
    await use(new CustomersPage(page));
  },
});

export const expect = test.expect;