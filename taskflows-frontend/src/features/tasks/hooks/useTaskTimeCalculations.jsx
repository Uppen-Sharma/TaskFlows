import { useMemo } from "react";
import { formatMinutesToTime } from "../../../utils/timeUtils";

export const useTaskTimeCalculations = (task) => {
  return useMemo(() => {
    // Remaining time from backend
    const remainingMinutes = task.currentEstimatedTime;

    // Timer running flag
    const isTimerRunning = !!task.timeTrackingStartedAt;

    // Timer expired check
    const isTimeExpired = remainingMinutes < 0;

    // Task completion status
    const isCompleted = task.status === "completed";

    // Format initial estimated time
    const initialTimeDisplay = formatMinutesToTime(task.initialEstimatedTime);

    // Check if current time differs from initial
    const timeDiffers = remainingMinutes !== task.initialEstimatedTime;

    // Format current time display, include "Over" if expired
    const currentTimeDisplay = isTimeExpired
      ? formatMinutesToTime(Math.abs(remainingMinutes)) + " (Over)"
      : formatMinutesToTime(remainingMinutes);

    return {
      remainingMinutes, // minutes left
      isTimeExpired, // expired flag
      isTimerRunning, // timer active flag
      isCompleted, // completion flag
      initialTimeDisplay, // formatted initial time
      currentTimeDisplay, // formatted current time
      timeDiffers, // differs from initial
    };
  }, [task]); // Recompute only when task changes
};
