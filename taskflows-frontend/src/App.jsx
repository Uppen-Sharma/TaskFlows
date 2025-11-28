import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import "./assets/styles/index.css";
import LoginRegister from "./features/auth/LoginRegister";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DashboardLayout from "./components/common/DashboardLayout";

// Loading Screen Component
const LoadingScreen = () => (
  <div className="w-full min-h-screen flex items-center justify-center bg-linear-to-br from-indigo-500 via-purple-500 to-pink-500">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mx-auto mb-4"></div>
      <p className="text-white text-lg font-semibold">Loading...</p>
    </div>
  </div>
);

// Protected Route Wrapper Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, currentUser, isLoading } = useSelector(
    (state) => state.auth
  );
  const role = currentUser?.role;

  if (isLoading) return <LoadingScreen />;
  // If not authenticated, redirect to login and prevent back navigation
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // If authenticated but unauthorized role, redirect to the root path
  if (allowedRoles && !allowedRoles.includes(role))
    return <Navigate to="/" replace />; // Note: '/' will handle role-based redirection

  return children;
};

// Role-Based Redirect Handler Component
const RoleBasedRedirect = () => {
  const { isAuthenticated, currentUser, isLoading } = useSelector(
    (state) => state.auth
  );
  const role = currentUser?.role;

  if (isLoading) return <LoadingScreen />;
  // If not authenticated, send to login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // If authenticated, send to the correct dashboard based on role
  if (role === "manager") return <Navigate to="/admin/dashboard" replace />;
  if (role === "user") return <Navigate to="/user/dashboard" replace />;

  // Fallback for unknown role (shouldn't happen)
  return <Navigate to="/login" replace />;
};

// Public Route Wrapper Component
const PublicRoute = ({ element }) => {
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);

  if (isLoading) return <LoadingScreen />;
  // If already logged in, redirect away from public pages (login/register)
  if (isAuthenticated) return <Navigate to="/" replace />;

  return element;
};

// Main App Component
const App = () => {
  return (
    <Router>
      <div className="w-full min-h-screen">
        {/* Global Toaster Notifications */}
        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              style: {
                background: "#28a745",
                color: "white",
              },
            },
            error: {
              style: {
                background: "#dc3545",
                color: "white",
              },
            },
          }}
        />

        <Routes>
          {/* Public Routes (Block access if logged in) */}
          <Route
            path="/login"
            element={<PublicRoute element={<LoginRegister />} />}
          />
          <Route
            path="/register"
            element={<PublicRoute element={<LoginRegister />} />}
          />

          {/* Protected Routes (Require Authentication) */}
          <Route
            path="/user/dashboard"
            element={
              // User and Manager can view the User Dashboard (for self-tasks)
              <ProtectedRoute allowedRoles={["user", "manager"]}>
                <DashboardLayout>
                  <UserDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              // Only Managers can view the Admin Dashboard
              <ProtectedRoute allowedRoles={["manager"]}>
                <DashboardLayout>
                  <AdminDashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Default Route: Role-based redirect or force to login */}
          <Route path="/" element={<RoleBasedRedirect />} />

          {/* 404 Fallback: Redirects any unknown path back to the main flow */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
