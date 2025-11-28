import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getTasks,
  createTask as createTaskAPI,
  deleteTaskById,
  updateTaskById,
  startTimerAPI,
  stopTimerAPI,
  adjustTaskTimeAPI,
  manageBaselineRequestAPI,
} from "../../lib/api/taskService";

// Async thunk to fetch tasks, accepts optional filters
export const fetchTasks = createAsyncThunk(
  "tasks/fetchTasks",
  async (filters = {}) => {
    return await getTasks(filters);
  }
);

// Async thunk to create a new task
export const createTask = createAsyncThunk(
  "tasks/createTask",
  async (taskPayload) => {
    return await createTaskAPI(taskPayload);
  }
);

// Async thunk to delete a task by ID
export const deleteTask = createAsyncThunk(
  "tasks/deleteTask",
  async (taskId) => {
    return await deleteTaskById(taskId);
  }
);

// Async thunk to update task fields
export const updateTask = createAsyncThunk(
  "tasks/updateTask",
  async ({ taskId, updatedFields }) => {
    return await updateTaskById(taskId, updatedFields);
  }
);

// Async thunk to start timer
export const startTimer = createAsyncThunk(
  "tasks/startTimer",
  async (taskId) => {
    return await startTimerAPI(taskId);
  }
);

// Async thunk to stop timer
export const stopTimer = createAsyncThunk("tasks/stopTimer", async (taskId) => {
  return await stopTimerAPI(taskId);
});

// Async thunk to adjust task time, optionally as baseline request
export const adjustTaskTime = createAsyncThunk(
  "tasks/adjustTaskTime",
  async ({ taskId, newTimeInMinutes, isBaselineRequest }) => {
    return await adjustTaskTimeAPI(taskId, newTimeInMinutes, isBaselineRequest);
  }
);

// Async thunk to approve/reject baseline request
export const manageBaseline = createAsyncThunk(
  "tasks/manageBaseline",
  async ({ taskId, action, approvedTime }) => {
    return await manageBaselineRequestAPI(taskId, action, approvedTime);
  }
);

// Initial Redux state
const initialState = {
  items: [], // List of tasks
  status: "idle", // fetch/create status
  error: null, // Error message
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.status = "loading"; // fetching started
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.status = "succeeded"; // fetch succeeded
        state.items = action.payload; // replace tasks
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.status = "failed"; // fetch failed
        state.error = action.error.message; // store error
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.items.push(action.payload); // add new task
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.items = state.items.filter((task) => task.id !== action.payload); // remove deleted task
      })
      // Generic matcher for fulfilled task updates
      .addMatcher(
        (action) =>
          action.type.startsWith("tasks/") &&
          action.type.endsWith("/fulfilled") &&
          action.payload?.id,
        (state, action) => {
          const index = state.items.findIndex(
            (task) => task.id === action.payload.id
          );
          if (index !== -1) {
            state.items[index] = { ...state.items[index], ...action.payload }; // merge updates
          }
        }
      );
  },
});

export default tasksSlice.reducer;
