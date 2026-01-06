import React from "react";
import { describe, it, expect, vi } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithProviders } from "../../../test/utils";
import TaskAccordionList from "./TaskAccordionList";

// Mock TaskItem for list behavior testing
vi.mock("./TaskItem", () => ({
  default: ({ task }) => <div data-testid="task-item">{task.name}</div>,
}));

describe("TaskAccordionList Component (TFT-11)", () => {
  // Shared mock handlers
  const mockHandlers = {
    expandedTaskIds: [],
    handleToggleTaskDetails: vi.fn(),
    handleTimeAdjust: vi.fn(),
  };

  it("renders empty state when no tasks", () => {
    renderWithProviders(
      <TaskAccordionList filteredTasks={[]} handlers={mockHandlers} />
    );

    expect(screen.getByText(/no tasks found/i)).toBeInTheDocument();
    expect(screen.getByText(/try adjusting your filters/i)).toBeInTheDocument();
  });

  it("renders task list when data exists", () => {
    const mockTasks = [
      { id: "1", name: "Task A", currentEstimatedTime: 60 },
      { id: "2", name: "Task B", currentEstimatedTime: 30 },
    ];

    renderWithProviders(
      <TaskAccordionList filteredTasks={mockTasks} handlers={mockHandlers} />
    );

    expect(screen.queryByText(/no tasks found/i)).not.toBeInTheDocument();

    const items = screen.getAllByTestId("task-item");
    expect(items).toHaveLength(2);
    expect(screen.getByText("Task A")).toBeInTheDocument();
    expect(screen.getByText("Task B")).toBeInTheDocument();
  });
});
