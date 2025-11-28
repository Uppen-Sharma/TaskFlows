import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getUsers } from "../../lib/api/userService";

// async thunk to fetch users from API
export const fetchUsers = createAsyncThunk("users/fetchUsers", getUsers);

// initial state
const initialState = { items: [], status: "idle", error: null };

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {}, // no synchronous reducers
  extraReducers: (builder) => {
    builder
      // pending state while fetching users
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
      })
      // fulfilled state, store fetched users
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      // rejected state, store error
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      });
  },
});

export default userSlice.reducer;
