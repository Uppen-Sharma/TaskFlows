import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useTaskTimeCalculations } from "./useTaskTimeCalculations";

// Mock formatter to isolate hook logic
vi.mock("../../../utils/timeUtils", () => ({
  formatMinutesToTime: vi.fn((mins) => `${mins}m formatted`),
}));

describe("useTaskTimeCalculations Hook (TFT-14)", () => {
  it("detects running timer", () => {
    const activeTask = {
      currentEstimatedTime: 60,
      initialEstimatedTime: 60,
      timeTrackingStartedAt: "2023-01-01T12:00:00Z", // Active timer
      status: "inprocess",
    };

    // Render hook without component
    const { result } = renderHook(() => useTaskTimeCalculations(activeTask));

    expect(result.current.isTimerRunning).toBe(true);
    expect(typeof result.current.remainingMinutes).toBe("number");
  });

  it("detects paused timer", () => {
    const pausedTask = {
      currentEstimatedTime: 60,
      initialEstimatedTime: 60,
      timeTrackingStartedAt: null,
      status: "onhold",
    };

    const { result } = renderHook(() => useTaskTimeCalculations(pausedTask));

    expect(result.current.isTimerRunning).toBe(false);
  });

  it("marks time as expired", () => {
    const expiredTask = {
      currentEstimatedTime: -10,
      initialEstimatedTime: 60,
      timeTrackingStartedAt: null,
    };

    const { result } = renderHook(() => useTaskTimeCalculations(expiredTask));

    expect(result.current.isTimeExpired).toBe(true);
    expect(result.current.currentTimeDisplay).toBe("10m formatted (Over)");
  });

  it("detects modified estimate", () => {
    const editedTask = {
      currentEstimatedTime: 50,
      initialEstimatedTime: 60, // Values differ
      timeTrackingStartedAt: null,
    };

    const { result } = renderHook(() => useTaskTimeCalculations(editedTask));

    expect(result.current.timeDiffers).toBe(true);
  });
});
