import { describe, it, expect, beforeAll, afterEach, afterAll } from "vitest";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { API_BASE_URL } from "../../config";
import { getUsers } from "./userService";

const API_URL_USERS = `${API_BASE_URL}/api/data/users`;

const handlers = [
  http.get(API_URL_USERS, ({ request }) => {
    // Check if the auth header is being passed correctly
    if (!request.headers.get("Authorization")) {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return HttpResponse.json([{ id: 1, name: "Admin User" }]);
  }),
];

const server = setupServer(...handlers);

describe("userService", () => {
  beforeAll(() => server.listen());
  afterEach(() => {
    server.resetHandlers();
    localStorage.clear();
  });
  afterAll(() => server.close());

  it("getUsers fetches user list with auth headers", async () => {
    localStorage.setItem(
      "currentUser",
      JSON.stringify({ token: "fake-token" })
    );

    const users = await getUsers();
    expect(users).toHaveLength(1);
    expect(users[0].name).toBe("Admin User");
  });

  it("throws error when API response is not ok", async () => {
    server.use(
      http.get(API_URL_USERS, () => {
        return HttpResponse.json(
          { message: "Failed to fetch" },
          { status: 500 }
        );
      })
    );

    await expect(getUsers()).rejects.toThrow("Failed to fetch");
  });
});
