import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, within } from "@testing-library/react";
import { renderWithProviders } from "../test/utils";
import AdminDashboard from "./AdminDashboard";
import * as useTaskDashboardHook from "../hooks/useTaskDashboard";

// Mock the hook
vi.mock("../hooks/useTaskDashboard", () => ({
  useTaskDashboard: vi.fn(),
}));

describe("AdminDashboard Component (TFT-10)", () => {
  const mockCurrentUser = {
    id: "admin-1",
    name: "Admin User",
    role: "manager",
  };

  const mockUsers = [
    {
      id: "u1",
      name: "Alice",
      role: "user",
      stats: { totalTasks: 5, completedTasks: 2, pendingTasks: 3 },
    },
    {
      id: "u2",
      name: "Bob",
      role: "user",
      stats: { totalTasks: 3, completedTasks: 3, pendingTasks: 0 },
    },
  ];

  const mockTasks = [
    { id: "t1", status: "pending", assignedTo: ["u1"] },
    { id: "t2", status: "completed", assignedTo: ["u1"] },
  ];

  const mockStats = {
    total: 2,
    proposed: 0,
    inProcess: 0,
    completed: 1,
    pending: 1,
    onHold: 0,
    closed: 0,
  };

  const mockHandlers = {
    handleCreateTask: vi.fn(),
    handleApproveProposal: vi.fn(),
    handleRejectProposal: vi.fn(),
    approveBaselineRequest: vi.fn(),
    rejectBaselineRequest: vi.fn(),

    // For TaskAccordionList
    expandedTaskIds: [],
    handleToggleTaskDetails: vi.fn(),
    handleTimeAdjust: vi.fn(),
    updateTaskStatus: vi.fn(),
    handleDeleteClick: vi.fn(),
    handleEditClick: vi.fn(),
    getUserNameById: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    useTaskDashboardHook.useTaskDashboard.mockReturnValue({
      currentUser: mockCurrentUser,
      users: mockUsers,
      tasks: mockTasks,
      stats: mockStats,
      loading: false,
      error: null,
      filters: { search: "", status: "all" },
      setFilters: vi.fn(),
      taskHandlers: mockHandlers,
      proposedTasks: [],
      expandedUserIds: [],
      toggleUserDetails: vi.fn(),
    });
  });

  it("renders admin stats and user list", () => {
    renderWithProviders(<AdminDashboard />);

    // Verify Title
    expect(screen.getByText("Manager Dashboard")).toBeInTheDocument();

    // Verify Global Stats
    const totalCard = screen
      .getByText("Total Tasks", { exact: false })
      .closest("div");
    expect(within(totalCard).getByText("2")).toBeInTheDocument();

    // Verify User List
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("opens the Create Task modal when button is clicked", () => {
    renderWithProviders(<AdminDashboard />);

    // Click the "Create New Task" button
    const createBtns = screen.getAllByRole("button", {
      name: /create new task/i,
    });
    fireEvent.click(createBtns[0]);

    // Verify Modal Heading
    const modalTitle = screen.getByRole("heading", {
      name: /create new task|propose new task/i,
    });

    expect(modalTitle).toBeInTheDocument();
  });
});
