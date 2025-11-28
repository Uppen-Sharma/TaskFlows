// Use the correct backend URL for the users endpoint
const API_URL_USERS = "http://localhost:5000/api/data/users";

// Helper function to get the JWT token from localStorage (Copied from taskService or ideally placed in a common utility)
const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (user && user.token) {
    return { Authorization: `Bearer ${user.token}` };
  }
  return {};
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Server error");
  }
  return response.json();
};

//  UPDATED getUsers
export const getUsers = () =>
  fetch(API_URL_USERS, {
    headers: getAuthHeader(), // <-- ADDED AUTH HEADER
  }).then(handleResponse);
