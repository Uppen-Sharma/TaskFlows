import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  screen,
  fireEvent,
  act,
  within,
  waitFor,
} from "@testing-library/react";
import { renderWithProviders } from "../test/utils";
import UserDashboard from "./UserDashboard";
import * as taskService from "../lib/api/taskService";
import toast from "react-hot-toast";

// Mock API and Toast
vi.mock("../lib/api/taskService", () => ({
  getTasks: vi.fn(),
  createTask: vi.fn(),
  updateTaskById: vi.fn(),
  startTimerAPI: vi.fn(),
  stopTimerAPI: vi.fn(),
}));

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

describe("UserDashboard Integration Tests", () => {
  const mockUser = {
    id: "u1",
    name: "Test User",
    username: "testuser",
    role: "user",
  };
  const mockUsersList = [
    { id: "u1", name: "Test User", username: "testuser", role: "user" },
    { id: "m1", name: "Manager Admin", username: "admin", role: "manager" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    taskService.getTasks.mockResolvedValue([]);
    window.confirm = vi.fn(() => true);
  });

  it("handles the full task proposal workflow", async () => {
    // Mock successful creation
    taskService.createTask.mockResolvedValue({
      id: "t3",
      name: "New Proposal",
    });

    renderWithProviders(<UserDashboard />, {
      preloadedState: {
        auth: {
          currentUser: mockUser,
          isAuthenticated: true,
          isLoading: false,
        },
        users: { items: mockUsersList },
        tasks: { items: [], status: "succeeded" },
      },
    });

    // 1. Open the Modal
    const openBtn = screen.getByRole("button", { name: /propose task/i });
    fireEvent.click(openBtn);

    // 2. WAIT for the Modal Heading - confirming UserCreateTaskModal rendered
    expect(
      await screen.findByRole("heading", { name: /propose new task/i })
    ).toBeInTheDocument();

    // 3. Find inputs by the exact placeholders in your TaskForm.jsx
    // nameInput matches "e.g., Update Landing Page"
    const nameInput = screen.getByPlaceholderText(/update landing page/i);
    // descInput matches "Briefly describe the requirements..."
    const descInput = screen.getByPlaceholderText(/describe the requirements/i);

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "New Proposal" } });
      fireEvent.change(descInput, {
        target: { value: "Detailed requirements here" },
      });

      // Select the first DurationInput (Days) and give it value
      // This covers the totalMins === 0 validation branch
      const durationInputs = screen.getAllByRole("spinbutton");
      fireEvent.change(durationInputs[0], { target: { value: "1" } });

      // 4. Click the "Propose Task" SUBMIT button inside the modal
      // We search 'within' the form to avoid the dashboard background button
      const form = screen
        .getByRole("heading", { name: /propose new task/i })
        .closest("div").parentElement;
      const submitBtn = within(form).getByRole("button", {
        name: /^propose task$/i,
      });
      fireEvent.click(submitBtn);
    });

    // 5. Verification of Thunk dispatch and API call
    await waitFor(() => {
      expect(taskService.createTask).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith(
        "New task proposed successfully!"
      );
    });
  });

  it("filters tasks by status via the dashboard toggle", async () => {
    renderWithProviders(<UserDashboard />, {
      preloadedState: {
        auth: { currentUser: mockUser, isAuthenticated: true },
        tasks: { items: [], status: "succeeded" },
      },
    });

    // Toggle button has text "All Tasks" and rounded-xl class
    const filterButtons = screen.getAllByRole("button", { name: /all tasks/i });
    const toggleBtn = filterButtons.find((b) =>
      b.className.includes("rounded-xl")
    );

    await act(async () => {
      fireEvent.click(toggleBtn);
    });

    // Find the specific 'Completed' button in the filter list
    const completedBtn = await screen.findByRole("button", {
      name: /^completed$/i,
    });

    await act(async () => {
      fireEvent.click(completedBtn);
    });

    expect(screen.getByText(/clear/i)).toBeInTheDocument();
  });
});
