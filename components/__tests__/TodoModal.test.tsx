import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import TodoModal from '../TodoModal';
import api from '../../lib/axios';

// Mock dependencies
jest.mock('../../lib/axios');
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    reload: jest.fn(),
  }),
}));
jest.mock('notistack', () => ({
  useSnackbar: () => ({
    enqueueSnackbar: jest.fn(),
  }),
}));

describe('TodoModal', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly when open', () => {
    render(
      <TodoModal
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(screen.getByText('Create Todo')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('submits the form correctly', async () => {
    (api.post as jest.Mock).mockResolvedValue({ data: {} });

    render(
      <TodoModal
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'New Todo' } });
    fireEvent.change(screen.getByLabelText('Description'), { target: { value: 'New Description' } });
    
    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/todos', {
        title: 'New Todo',
        description: 'New Description',
        status: 'BACKLOG',
        dueTime: undefined,
      });
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  it('populates form when editing an existing todo', () => {
    const todo = {
      id: '1',
      title: 'Existing Todo',
      description: 'Existing Description',
      status: 'IN_PROGRESS',
      dueTime: '2023-01-01T12:00:00.000Z',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    render(
      <TodoModal
        open={true}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
        todo={todo}
      />
    );

    expect(screen.getByText('Edit Todo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Todo')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Description')).toBeInTheDocument();
  });
});
