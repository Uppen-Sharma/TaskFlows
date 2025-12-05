import { API_BASE_URL } from "../../config";
const API_URL_USERS = `${API_BASE_URL}/api/data/users`;

// Helper function to get the JWT token from localStorage
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
    headers: getAuthHeader(),
  }).then(handleResponse);
