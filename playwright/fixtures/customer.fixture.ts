import { test as base } from '@playwright/test';
import { CustomersPage } from '../pages/customers.page';

type Fixtures = {
  customersPage: CustomersPage;
};

export const test = base.extend<Fixtures>({
  customersPage: async ({ page }, use) => {
    await use(new CustomersPage(page));
  },
});

export { expect } from '@playwright/test';