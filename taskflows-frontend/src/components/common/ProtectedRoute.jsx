// src/components/common/ProtectedRoute.jsx
import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({
  children,
  requiredRole = null,
  allowedRoles = null,
}) => {
  const { isAuthenticated, currentUser, isLoading } = useSelector(
    (state) => state.auth
  );

  // 1. Loading State
  if (isLoading) {
    return <div className="p-4 text-white">Loading...</div>;
  }

  // 2. Auth Check
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. Role Check (Supports both 'requiredRole' string and 'allowedRoles' array)
  const role = currentUser?.role;

  // Handle array of roles (e.g. ['user', 'manager'])
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect based on role to their appropriate dashboard
    const target = role === "manager" ? "/admin/dashboard" : "/user/dashboard";
    return <Navigate to={target} replace />;
  }

  // Handle single required role
  if (requiredRole && role !== requiredRole) {
    const target = role === "manager" ? "/admin/dashboard" : "/user/dashboard";
    return <Navigate to={target} replace />;
  }

  // 4. Access Granted
  return children;
};

export default ProtectedRoute;
