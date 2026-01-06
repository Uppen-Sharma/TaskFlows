import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../../test/utils';
import TaskEditModal from './TaskEditModal';

// Mock time utilities for predictable behavior
vi.mock('../../../utils/timeUtils', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    minutesToDurationObject: () => ({ d: 0, h: 1, m: 0 }),
    formatMinutesToTime: (mins) => `${mins}m`,
    durationToMinutes: () => 60,
  };
});

describe('TaskEditModal Component (TFT-15)', () => {
  const mockTask = {
    id: 't1',
    name: 'Original Task Name',
    description: 'Original Description',
    status: 'inprocess',
    currentEstimatedTime: 60,
    assignedTo: ['u1'],
    userSuggestedBaseline: null,
  };

  const mockUsers = [
    { id: 'u1', name: 'Alice', role: 'user' },
    { id: 'u2', name: 'Bob', role: 'user' },
  ];

  const mockHandlers = {
    onSave: vi.fn(),
    onClose: vi.fn(),
    approveBaselineRequest: vi.fn(),
    rejectBaselineRequest: vi.fn(),
  };

  it('renders pre-filled task data', () => {
    renderWithProviders(
      <TaskEditModal task={mockTask} users={mockUsers} {...mockHandlers} />
    );

    // Verify initial values
    expect(screen.getByText(/edit/i)).toBeInTheDocument();
    expect(screen.getByDisplayValue('Original Task Name')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Original Description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('In Process')).toBeInTheDocument();
  });

  it('submits updated task data', () => {
    renderWithProviders(
      <TaskEditModal task={mockTask} users={mockUsers} {...mockHandlers} />
    );

    // Update task name
    const nameInput = screen.getByDisplayValue('Original Task Name');
    fireEvent.change(nameInput, { target: { value: 'Updated Task Name' } });

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    expect(mockHandlers.onSave).toHaveBeenCalledWith(
      't1',
      expect.objectContaining({
        name: 'Updated Task Name',
        description: 'Original Description',
        status: 'inprocess',
      })
    );
  });

  it('shows approve and reject actions for requests', () => {
    const taskWithRequest = {
      ...mockTask,
      userSuggestedBaseline: 90,
    };

    renderWithProviders(
      <TaskEditModal
        task={taskWithRequest}
        users={mockUsers}
        {...mockHandlers}
      />
    );

    // Verify request actions
    expect(screen.getByText(/request:/i)).toBeInTheDocument();

    const approveBtn = screen.getByRole('button', { name: /approve/i });
    const rejectBtn = screen.getByRole('button', { name: /reject/i });

    expect(approveBtn).toBeInTheDocument();
    expect(rejectBtn).toBeInTheDocument();

    // Confirm approve flow
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    fireEvent.click(approveBtn);

    expect(mockHandlers.approveBaselineRequest).toHaveBeenCalledWith('t1', 90);
  });
});
