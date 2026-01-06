import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent } from "@testing-library/react";
import { renderWithProviders } from "../../../test/utils";
import TaskItem from "./TaskItem";
import * as timeHook from "../hooks/useTaskTimeCalculations";

// force the component into specific states instantly
vi.mock("../hooks/useTaskTimeCalculations", () => ({
  useTaskTimeCalculations: vi.fn(),
}));

// Avoid unecessary complexity
vi.mock("../../../utils/timeUtils", () => ({
  minutesToDurationObject: () => ({ d: 0, h: 0, m: 0 }),
  durationToMinutes: () => 0,
}));

describe("TaskItem Component (TFT-13)", () => {
  const mockHandlers = {
    handleTimeAdjust: vi.fn(),
    updateTaskStatus: vi.fn(),
    handleDeleteClick: vi.fn(),
    handleEditClick: vi.fn(),
    getUserNameById: vi.fn(() => "Test User"), // avoid dependency on real data
    startTimer: vi.fn(),
    stopTimer: vi.fn(),
  };

  const baseTask = {
    id: "t1",
    name: "Test Task",
    status: "pending",
    assignedTo: ["u1"],
    assignedBy: "manager-1",
    description: "Test Description",
    userSuggestedBaseline: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders START button when timer is NOT running", () => {
    timeHook.useTaskTimeCalculations.mockReturnValue({
      isTimerRunning: false,
      isTimeExpired: false,
      currentTimeDisplay: "10m",
      remainingMinutes: 10,
      timeDiffers: false,
    });

    // Render with a 'pending' task
    renderWithProviders(
      <TaskItem
        task={baseTask} // uses pending status
        handlers={mockHandlers}
        mode="user"
        isExpanded={true}
        toggleExpand={vi.fn()}
      />
    );

    const startBtn = screen.getByRole("button", { name: /start timer/i });
    expect(startBtn).toBeInTheDocument();

    fireEvent.click(startBtn);

    expect(mockHandlers.startTimer).toHaveBeenCalledWith("t1"); // task id
  });

  it("renders STOP button when timer IS running", () => {
    timeHook.useTaskTimeCalculations.mockReturnValue({
      isTimerRunning: true,
      isTimeExpired: false,
      currentTimeDisplay: "10m",
      remainingMinutes: 10,
      timeDiffers: false,
    });

    renderWithProviders(
      <TaskItem
        task={{ ...baseTask, status: "inprocess" }}
        handlers={mockHandlers}
        mode="user"
        isExpanded={true}
        toggleExpand={vi.fn()}
      />
    );

    const stopBtn = screen.getByRole("button", { name: /stop timer/i });
    expect(stopBtn).toBeInTheDocument();

    fireEvent.click(stopBtn);

    expect(mockHandlers.stopTimer).toHaveBeenCalledWith("t1");
  });
});
