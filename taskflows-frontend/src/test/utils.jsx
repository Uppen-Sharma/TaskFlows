import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { BrowserRouter } from "react-router-dom";
import authReducer from "../features/auth/authSlice";
import taskReducer from "../features/tasks/taskSlice";
import userReducer from "../features/users/userSlice";

export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    store = configureStore({
      reducer: {
        auth: authReducer,
        tasks: taskReducer,
        users: userReducer,
      },
      preloadedState,
    }),
    includeRouter = true, // Added flag
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        {/* Conditional logic: Use Router only if requested */}
        {includeRouter ? <BrowserRouter>{children}</BrowserRouter> : children}
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}
