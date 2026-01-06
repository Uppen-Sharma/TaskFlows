import React from "react";
import { describe, it, expect, vi } from "vitest";
import { screen, fireEvent, within } from "@testing-library/react";
import { renderWithProviders } from "../../test/utils";
import LoginRegister from "./LoginRegister";
import * as authSlice from "./authSlice";

// Mock login thunk to prevent real API call
vi.spyOn(authSlice, "loginUser").mockImplementation(() => ({
  type: "auth/loginUser/pending",
}));

describe("LoginRegister Component (TFT-6)", () => {
  it("renders login form by default", () => {
    renderWithProviders(<LoginRegister />);

    // Verify login inputs exist
    expect(
      screen.getByPlaceholderText(/username or email/i)
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^Password$/)).toBeInTheDocument();

    // Verify submit button exists
    const signInButtons = screen.getAllByRole("button", { name: /sign in/i });
    const submitBtn = signInButtons.find((btn) => btn.type === "submit");
    expect(submitBtn).toBeInTheDocument();
  });

  it("allows user to type in login fields", () => {
    renderWithProviders(<LoginRegister />);

    const usernameInput = screen.getByPlaceholderText(/username or email/i);
    const passwordInput = screen.getByPlaceholderText(/^Password$/);

    // Simulate user input
    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Verify input values updated
    expect(usernameInput.value).toBe("testuser");
    expect(passwordInput.value).toBe("password123");
  });

  it("switches to register mode when link is clicked", async () => {
    renderWithProviders(<LoginRegister />);

    // Locate register switch button
    const switchText = screen.getByText(/don't have an account/i);
    const createAccountBtn = within(switchText.closest("p")).getByRole(
      "button",
      { name: /create account/i }
    );

    // Trigger mode switch
    fireEvent.click(createAccountBtn);

    // Verify register-only field appears
    expect(await screen.findByPlaceholderText(/full name/i)).toBeVisible();
  });
});
