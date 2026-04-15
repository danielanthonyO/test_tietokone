import { test } from '../fixtures/customer.fixture';

test('customer page loads', async ({ customersPage }) => {
  await customersPage.goto();
  await customersPage.expectPageLoaded();
});

test('create customer flow', async ({ customersPage }) => {
  const name = `Customer ${Date.now()}`;

  await customersPage.goto();
  await customersPage.openCreateCustomerForm();
  await customersPage.fillCustomerName(name);
  await customersPage.saveCustomer();
  await customersPage.expectCustomerVisible(name);
});