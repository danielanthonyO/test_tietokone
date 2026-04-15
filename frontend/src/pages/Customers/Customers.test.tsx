import { http, HttpResponse } from 'msw';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Customers from './Customers';
import { renderWithProviders } from '../../tests/render';
import { server } from '../../tests/setup';

const apiBase = 'http://localhost:3000';

describe('Customers page', () => {
  it('renders customers fetched from the API and filters them by search text', async () => {
    server.use(
      http.get(`${apiBase}/customers`, () =>
        HttpResponse.json([
          { id: '1', name: 'Jane Doe', type: 'INDIVIDUAL', email: 'jane@example.com', phone: '1234567' },
          { id: '2', name: 'Acme Oy', type: 'COMPANY', email: 'hello@acme.test', phone: '7654321' },
        ]),
      ),
      http.get(`${apiBase}/orders`, () => HttpResponse.json([])),
    );

    renderWithProviders(<Customers />);

    expect(await screen.findByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('Acme Oy')).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText(/search customer/i), 'acme');

    await waitFor(() => {
      expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Acme Oy')).toBeInTheDocument();
  });

  it('shows a friendly empty state when no customers match the search', async () => {
    server.use(
      http.get(`${apiBase}/customers`, () =>
        HttpResponse.json([
          { id: '1', name: 'Jane Doe', type: 'INDIVIDUAL', email: 'jane@example.com', phone: '1234567' },
        ]),
      ),
      http.get(`${apiBase}/orders`, () => HttpResponse.json([])),
    );

    renderWithProviders(<Customers />);

    expect(await screen.findByText('Jane Doe')).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText(/search customer/i), 'missing');

    expect(await screen.findByText(/no customers found/i)).toBeInTheDocument();
  });
});
