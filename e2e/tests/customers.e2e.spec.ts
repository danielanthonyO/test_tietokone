import { test } from '../fixtures/customer.fixture';

const unique = Date.now();
const customerName = `Customer ${unique}`;
const customerEmail = `customer-${unique}@example.com`;

test('customer page loads', async ({ customersPage }) => {
  await customersPage.goto();
  await customersPage.expectPageLoaded();
});

test('create and search customer flow', async ({ customersPage }) => {
  await customersPage.goto();
  await customersPage.createCustomer(customerName, customerEmail, '1234567');
  await customersPage.search(customerName);
  await customersPage.expectCustomerVisible(customerName);
});

test('edit and delete customer flow', async ({ customersPage }) => {
  await customersPage.goto();
  await customersPage.createCustomer(`${customerName} edit`, `edit-${customerEmail}`, '1111111');
  await customersPage.search(`${customerName} edit`);
  await customersPage.expandCustomer(`${customerName} edit`);
  await customersPage.openEditCustomer();
  await customersPage.updatePhone('7654321');
  await customersPage.expandCustomer(`${customerName} edit`);
  await customersPage.expectPhoneVisible('7654321');
  await customersPage.deleteCustomer();
  await customersPage.expectEmptyState();
});
