import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import userReducer from "../features/users/userSlice";
import taskReducer from "../features/tasks/taskSlice";

// combine all reducers larger app state
const appReducer = combineReducers({
  auth: authReducer,
  users: userReducer,
  tasks: taskReducer,
});

// reset state on logout
const rootReducer = (state, action) => {
  if (action.type === "auth/logoutUser/fulfilled") {
    state = undefined;
  }
  // pass to combined reducers undefined state
  return appReducer(state, action);
};

// create redux store
export const store = configureStore({
  reducer: rootReducer,
});
