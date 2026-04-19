import { test as base } from '@playwright/test';
import { CustomersPage } from '../pages/customers.page';

type Fixtures = {
  customersPage: CustomersPage;
};

export const test = base.extend<Fixtures>({
  customersPage: async ({ page }, use) => {
    const customersPage = new CustomersPage(page);
    await use(customersPage);
  },
});