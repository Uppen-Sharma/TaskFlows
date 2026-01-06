import {
  describe,
  it,
  expect,
  beforeEach,
  beforeAll,
  afterEach,
  afterAll,
} from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "../../config";
import * as taskService from "./taskService";

const API_URL = `${API_BASE_URL}/api/data/tasks`;

// 1. Define MSW Handlers to intercept network requests
const handlers = [
  // Mock GET Tasks
  http.get(API_URL, ({ request }) => {
    const url = new URL(request.url);
    // If we pass a specific search term, trigger a mock error for testing handleResponse
    if (url.searchParams.get("search") === "trigger-error") {
      return HttpResponse.json(
        { message: "Mocked API Error" },
        { status: 400 }
      );
    }
    return HttpResponse.json([{ id: "1", title: "Test Task" }]);
  }),

  // Mock DELETE Task (Returns 204 No Content)
  http.delete(`${API_URL}/:id`, () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // Mock PATCH for Timer
  http.patch(`${API_URL}/:id/start-timer`, () => {
    return HttpResponse.json({ id: "1", status: "running" });
  }),

  // Mock PATCH for Adjust Time
  http.patch(`${API_URL}/:id/adjust-time`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({ success: true, received: body });
  }),
];

const server = setupServer(...handlers);

describe("taskService", () => {
  // Setup MSW Lifecycle
  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    localStorage.clear();
  });
  afterAll(() => server.close());

  beforeEach(() => {
    // Setup fake user in localStorage so getAuthHeader() works
    const mockUser = { token: "fake-jwt-token" };
    localStorage.setItem("currentUser", JSON.stringify(mockUser));
  });

  //Testing getTasks
  it("getTasks should fetch tasks and handle query params", async () => {
    const data = await taskService.getTasks({ name: "Clean" });
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].title).toBe("Test Task");
  });

  //Testing Error Handling (handleResponse)
  it("should throw an error when the server returns a non-ok status", async () => {
    await expect(
      taskService.getTasks({ name: "trigger-error" })
    ).rejects.toThrow("Mocked API Error");
  });

  //Testing DELETE (204 No Content)
  it("should return taskId after successfully deleting a task", async () => {
    const taskId = "123";
    const result = await taskService.deleteTaskById(taskId);
    expect(result).toBe(taskId);
  });

  //Testing Timer APIs
  it("startTimerAPI should return updated task state", async () => {
    const data = await taskService.startTimerAPI("1");
    expect(data.status).toBe("running");
  });

  //Testing Baseline Adjustments
  it("adjustTaskTimeAPI should send correct payload", async () => {
    const result = await taskService.adjustTaskTimeAPI("1", 45, true);
    expect(result.received).toEqual({
      newTimeInMinutes: 45,
      isBaselineRequest: true,
    });
  });
});
