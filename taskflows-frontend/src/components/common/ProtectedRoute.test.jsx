import React from "react";
import { describe, it, expect } from "vitest";
import { screen } from "@testing-library/react";
import { Routes, Route } from "react-router-dom";
import { renderWithProviders } from "../../test/utils";
import ProtectedRoute from "./ProtectedRoute";

// Simulate browser navigation
const navigateTo = (path) => window.history.pushState({}, "Test Page", path);

describe("ProtectedRoute Component (TFT-7)", () => {
  it("redirects to login when unauthenticated", () => {
    // Navigate to protected route
    navigateTo("/protected");

    renderWithProviders(
      <Routes>
        <Route path="/login" element={<h1>Login Page</h1>} />
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <h1>Secret Content</h1>
            </ProtectedRoute>
          }
        />
      </Routes>,
      {
        // Force unauthenticated state
        preloadedState: {
          auth: { isAuthenticated: false, currentUser: null, isLoading: false },
        },
      }
    );

    // Login page should render
    expect(screen.getByText("Login Page")).toBeInTheDocument();
    // Protected content should be hidden
    expect(screen.queryByText("Secret Content")).not.toBeInTheDocument();
  });

  it("renders protected content when authenticated", () => {
    navigateTo("/protected");

    renderWithProviders(
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute>
              <h1>Secret Content</h1>
            </ProtectedRoute>
          }
        />
      </Routes>,
      {
        // Force authenticated state
        preloadedState: {
          auth: {
            isAuthenticated: true,
            currentUser: { role: "user" },
            isLoading: false,
          },
        },
      }
    );

    // Protected content should render
    expect(screen.getByText("Secret Content")).toBeInTheDocument();
  });

  it("redirects on role mismatch", () => {
    navigateTo("/admin-only");

    renderWithProviders(
      <Routes>
        <Route path="/user/dashboard" element={<h1>User Dashboard</h1>} />
        <Route
          path="/admin-only"
          element={
            // Requires manager role
            <ProtectedRoute requiredRole="manager">
              <h1>Admin Secrets</h1>
            </ProtectedRoute>
          }
        />
      </Routes>,
      {
        // Logged in but wrong role
        preloadedState: {
          auth: {
            isAuthenticated: true,
            currentUser: { role: "user" },
            isLoading: false,
          },
        },
      }
    );

    // Redirected to dashboard
    expect(screen.getByText("User Dashboard")).toBeInTheDocument();
    // Admin content blocked
    expect(screen.queryByText("Admin Secrets")).not.toBeInTheDocument();
  });
});
