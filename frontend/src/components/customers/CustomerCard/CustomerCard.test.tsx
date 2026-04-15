import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { renderWithProviders } from '../../../tests/render';
import CustomerCard from './CustomerCard';

const { invalidateQueries, mutate, toastSuccess } = vi.hoisted(() => ({
  invalidateQueries: vi.fn(),
  mutate: vi.fn(),
  toastSuccess: vi.fn(),
}));

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual<typeof import('@tanstack/react-query')>('@tanstack/react-query');
  return {
    ...actual,
    useQuery: () => ({ data: [], isPending: false }),
    useQueryClient: () => ({ invalidateQueries }),
    useMutation: () => ({ mutate, isPending: false }),
  };
});

vi.mock('react-hot-toast', () => ({
  default: {
    success: toastSuccess,
  },
}));

describe('CustomerCard', () => {
  const customer = {
    id: '1',
    name: 'Jane Doe',
    type: 'INDIVIDUAL',
    email: 'jane@example.com',
    phone: '1234567',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders expanded details and opens the delete confirmation modal', async () => {
    renderWithProviders(
      <CustomerCard
        customer={customer}
        isExpanded
        onExpand={vi.fn()}
        isEditing={false}
        onEdit={vi.fn()}
        onCloseEdit={vi.fn()}
      />,
    );

    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    expect(screen.getByText('1234567')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: /delete/i }));

    expect(screen.getByText(/delete this customer from the system/i)).toBeInTheDocument();
  });
});
