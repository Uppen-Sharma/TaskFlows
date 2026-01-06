import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "../../config";
import tasksReducer, {
  fetchTasks,
  createTask,
  deleteTask,
  updateTask,
} from "./taskSlice";
import { configureStore } from "@reduxjs/toolkit";

const API_TASKS_URL = `${API_BASE_URL}/api/data/tasks`;

// 1. MSW Handlers for Task Operations
const handlers = [
  http.get(API_TASKS_URL, () => {
    return HttpResponse.json([{ id: "1", title: "Test Task" }]);
  }),
  http.post(API_TASKS_URL, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ id: "2", ...body });
  }),
  http.delete(`${API_TASKS_URL}/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),
  http.patch(`${API_TASKS_URL}/:id`, async ({ request, params }) => {
    const body = await request.json();
    return HttpResponse.json({ id: params.id, ...body });
  }),
];

const server = setupServer(...handlers);

describe("tasksSlice Thunks and Matchers", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  const getStore = () => configureStore({ reducer: { tasks: tasksReducer } });

  // Test fetchTasks
  it("should handle fetchTasks pending and fulfilled", async () => {
    const store = getStore();
    const promise = store.dispatch(fetchTasks());

    expect(store.getState().tasks.status).toBe("loading");

    await promise;
    const state = store.getState().tasks;
    expect(state.status).toBe("succeeded");
    expect(state.items).toHaveLength(1);
    expect(state.items[0].title).toBe("Test Task");
  });

  // Test createTask
  it("should add a new task to items on fulfilled", async () => {
    const store = getStore();
    await store.dispatch(createTask({ title: "New Task" }));

    const state = store.getState().tasks;
    expect(state.items).toHaveLength(1);
    expect(state.items[0].id).toBe("2");
  });

  // Test deleteTask
  it("should remove task from items on fulfilled", async () => {
    const preloadedState = {
      tasks: {
        items: [{ id: "1", title: "To Delete" }],
        status: "idle",
        error: null,
      },
    };
    const store = configureStore({
      reducer: { tasks: tasksReducer },
      preloadedState,
    });

    await store.dispatch(deleteTask("1"));

    expect(store.getState().tasks.items).toHaveLength(0);
  });

  // Test addMatcher Logic (Update Logic)
  it("should update an existing task via updateTask (matcher)", async () => {
    const preloadedState = {
      tasks: {
        items: [{ id: "1", title: "Old Title" }],
        status: "idle",
        error: null,
      },
    };
    const store = configureStore({
      reducer: { tasks: tasksReducer },
      preloadedState,
    });

    await store.dispatch(
      updateTask({ taskId: "1", updatedFields: { title: "New Title" } })
    );

    const state = store.getState().tasks;
    expect(state.items[0].title).toBe("New Title");
  });

  // Test fetchTasks rejection
  it("should handle fetchTasks error", async () => {
    server.use(
      http.get(API_TASKS_URL, () => {
        return new HttpResponse(null, { status: 500 });
      })
    );
    const store = getStore();
    await store.dispatch(fetchTasks());

    const state = store.getState().tasks;
    expect(state.status).toBe("failed");
    expect(state.error).toBeDefined();
  });
});
