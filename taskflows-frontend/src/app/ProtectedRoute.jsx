// imports
import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

// protected route
const ProtectedRoute = ({ children, requiredRole = null }) => {
  // get auth state
  const { isAuthenticated, currentUser, isLoading } = useSelector(
    (state) => state.auth
  );

  // loading state
  if (isLoading) {
    return (
      <div className="text-white text-center py-10">
        Loading authentication state...
      </div>
    );
  }

  // check auth
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // check role
  if (requiredRole && currentUser?.role !== requiredRole) {
    const targetPath = currentUser?.role === "manager" ? "/admin" : "/user";
    return <Navigate to={targetPath} replace />;
  }

  // allow access
  return children;
};

export default ProtectedRoute;
