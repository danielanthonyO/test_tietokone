import { test } from '../fixtures/customer.fixture';

const uniqueValue = () => Date.now().toString();


test('customer page loads', async ({ customersPage }) => {
  await customersPage.goto();
  await customersPage.expectPageLoaded();
});

test('create and search customer flow', async ({ customersPage }) => {
  const unique = uniqueValue();
  const customerName = `Customer ${unique}`;
  const customerEmail = `customer-${unique}@example.com`;

  await customersPage.goto();
  await customersPage.createCustomer(customerName, customerEmail, '1234567');

  await customersPage.search(customerName);
  await customersPage.expectCustomerVisible(customerName);
});

test('create and delete customer flow', async ({ customersPage }) => {
  const unique = uniqueValue();
  const customerName = `Customer ${unique} delete`;
  const customerEmail = `delete-${unique}@example.com`;

  await customersPage.goto();
  await customersPage.createCustomer(customerName, customerEmail, '1111111');

  await customersPage.search(customerName);
  await customersPage.expectCustomerVisible(customerName);

  await customersPage.expandCustomer(customerName);
  await customersPage.deleteCustomer();

  await customersPage.search(customerName);
  await customersPage.expectEmptyState();
  await customersPage.expectCustomerNotVisible(customerName);
});