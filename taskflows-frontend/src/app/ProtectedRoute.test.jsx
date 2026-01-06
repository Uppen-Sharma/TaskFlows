import { screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { renderWithProviders } from "../test/utils";
import { describe, it, expect } from "vitest";

describe("ProtectedRoute Component", () => {
  const ProtectedContent = () => <div>Secret Content</div>;

  it("smart redirects when role mismatch", () => {
    renderWithProviders(
      <MemoryRouter initialEntries={["/user-only"]}>
        <Routes>
          {/* We start at /user-only, but expect to land on /admin */}
          <Route path="/admin" element={<div>Admin Dashboard</div>} />
          <Route
            path="/user-only"
            element={
              <ProtectedRoute requiredRole="user">
                <ProtectedContent />
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
      {
        includeRouter: false, // Prevents the duplicate Router error
        preloadedState: {
          auth: {
            isAuthenticated: true,
            currentUser: { role: "manager" }, // Manager role mismatch
            isLoading: false,
          },
        },
      }
    );

    // If the logic works, the manager is redirected to the /admin route
    expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
  });
});
