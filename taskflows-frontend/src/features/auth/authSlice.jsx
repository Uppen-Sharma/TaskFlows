import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { API_BASE_URL } from "../../config";

const API_AUTH_URL = `${API_BASE_URL}/api/auth`;

// login async thunk
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ usernameOrEmail, password }, { rejectWithValue }) => {
    try {
      localStorage.removeItem("currentUser"); // clear existing user

      const response = await fetch(`${API_AUTH_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernameOrEmail, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message); // Sends error to Redux
      }

      const userData = await response.json(); // successful login
      const currentUser = {
        id: userData.id,
        name: userData.name,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        token: userData.token,
      };

      localStorage.setItem("currentUser", JSON.stringify(currentUser)); // browser storage stay logged in
      return currentUser;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
); 

// register async thunk
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await fetch(`${API_AUTH_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.message);
      }

      return response.json();
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// logout async thunk
export const logoutUser = createAsyncThunk("auth/logoutUser", async () => {
  try {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user && user.token) {
      await fetch(`${API_AUTH_URL}/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${user.token}` },
      });
    }
  } catch (error) {
    console.error("Logout logging failed", error);
  }
  localStorage.removeItem("currentUser");
  return null;
});

// initial state
const savedUser = localStorage.getItem("currentUser");
const initialState = {
  currentUser: savedUser ? JSON.parse(savedUser) : null,
  isAuthenticated: !!savedUser,
  isLoading: false,
  error: null,
  registrationStatus: "idle",
};

// auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetRegistrationStatus: (state) => {
      state.registrationStatus = "idle"; // reset status
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // login
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentUser = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });

    // register
    builder.addCase(registerUser.pending, (state) => {
      state.registrationStatus = "loading";
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state) => {
      state.registrationStatus = "succeeded";
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.registrationStatus = "failed";
      state.error = action.payload;
    });

    // logout
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
      state.error = null;
    });
  },
});

export const { resetRegistrationStatus } = authSlice.actions;
export default authSlice.reducer;
