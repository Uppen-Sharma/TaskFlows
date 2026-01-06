import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "../../config";
import authReducer, {
  loginUser,
  registerUser,
  logoutUser,
  resetRegistrationStatus,
} from "./authSlice";
import { configureStore } from "@reduxjs/toolkit";

const API_AUTH_URL = `${API_BASE_URL}/api/auth`;

// 1. MSW Handlers
const handlers = [
  http.post(`${API_AUTH_URL}/login`, async ({ request }) => {
    const { usernameOrEmail } = await request.json();
    if (usernameOrEmail === "fail@test.com") {
      return HttpResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }
    return HttpResponse.json({ id: 1, name: "John Doe", token: "mock-token" });
  }),
  http.post(`${API_AUTH_URL}/register`, () =>
    HttpResponse.json({ success: true })
  ),
  http.post(
    `${API_AUTH_URL}/logout`,
    () => new HttpResponse(null, { status: 200 })
  ),
];

const server = setupServer(...handlers);

describe("authSlice Thunks and Reducers", () => {
  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    localStorage.clear();
  });
  afterAll(() => server.close());

  // --- Initial State and Sync Reducers ---
  it("should handle resetRegistrationStatus", () => {
    const prevState = { registrationStatus: "failed", error: "some error" };
    const state = authReducer(prevState, resetRegistrationStatus());
    expect(state.registrationStatus).toBe("idle");
    expect(state.error).toBe(null);
  });

  // --- loginUser Thunk Tests ---
  describe("loginUser thunk", () => {
    it("updates state and localStorage on fulfilled login", async () => {
      const store = configureStore({ reducer: { auth: authReducer } });
      await store.dispatch(
        loginUser({ usernameOrEmail: "test@test.com", password: "123" })
      );

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.currentUser.name).toBe("John Doe");
      expect(localStorage.getItem("currentUser")).toContain("John Doe");
    });

    it("handles login rejection", async () => {
      const store = configureStore({ reducer: { auth: authReducer } });
      await store.dispatch(loginUser({ usernameOrEmail: "fail@test.com" }));

      const state = store.getState().auth;
      expect(state.error).toBe("Invalid credentials");
      expect(state.isAuthenticated).toBe(false);
    });
  });

  // --- logoutUser Thunk Tests ---
  describe("logoutUser thunk", () => {
    it("clears state and localStorage on logout", async () => {
      // Setup: Start with a logged in state
      localStorage.setItem(
        "currentUser",
        JSON.stringify({ token: "abc", name: "User" })
      );
      const store = configureStore({
        reducer: { auth: authReducer },
        preloadedState: {
          auth: { isAuthenticated: true, currentUser: { name: "User" } },
        },
      });

      await store.dispatch(logoutUser());

      const state = store.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.currentUser).toBeNull();
      expect(localStorage.getItem("currentUser")).toBeNull();
    });
  });

  // --- registerUser Thunk Tests ---
  describe("registerUser thunk", () => {
    it("sets registrationStatus to succeeded on success", async () => {
      const store = configureStore({ reducer: { auth: authReducer } });
      await store.dispatch(registerUser({ username: "new" }));

      expect(store.getState().auth.registrationStatus).toBe("succeeded");
    });
  });
});
