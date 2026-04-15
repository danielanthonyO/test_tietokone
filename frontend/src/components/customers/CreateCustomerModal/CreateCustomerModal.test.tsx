import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderWithProviders } from '../../../tests/render';
import CreateCustomerModal from './CreateCustomerModal';

const invalidateQueries = vi.fn();
const mutate = vi.fn();
const toastError = vi.fn();

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: () => ({ invalidateQueries }),
    useMutation: () => ({ mutate, isPending: false }),
  };
});

vi.mock('react-hot-toast', () => ({
  default: {
    error: toastError,
  },
}));

describe('CreateCustomerModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('submits a valid customer and closes the modal', async () => {
    const onClose = vi.fn();
    const { container } = renderWithProviders(
      <CreateCustomerModal isOpen onClose={onClose} />,
    );

    await userEvent.type(container.querySelector('input[name="name"]')!, 'Jane Doe');
    await userEvent.type(container.querySelector('input[name="email"]')!, 'jane@example.com');
    await userEvent.type(container.querySelector('input[name="phone"]')!, '1234567');

    await userEvent.click(screen.getByRole('button', { name: /add/i }));

    expect(mutate).toHaveBeenCalledWith({
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '1234567',
      type: 'INDIVIDUAL',
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('blocks submission when the email is invalid', async () => {
    const onClose = vi.fn();
    const { container } = renderWithProviders(
      <CreateCustomerModal isOpen onClose={onClose} />,
    );

    await userEvent.type(container.querySelector('input[name="name"]')!, 'Jane Doe');
    await userEvent.type(container.querySelector('input[name="email"]')!, 'not-an-email');

    await userEvent.click(screen.getByRole('button', { name: /add/i }));

    expect(toastError).toHaveBeenCalledWith('Invalid email');
    expect(mutate).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
