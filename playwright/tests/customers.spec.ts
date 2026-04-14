import { test, expect } from '../fixtures/customer.fixture';

test('create customer', async ({ customersPage }) => {
  await customersPage.goto();

  const name = 'Test Customer';
  await customersPage.createCustomer(name);

  await customersPage.expectCustomerVisible(name);
});