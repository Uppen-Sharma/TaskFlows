import { API_BASE_URL } from "../../config";
const API_URL_BASE = `${API_BASE_URL}/api/data/tasks`;

// Helper function to get the JWT token from localStorage
const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (user && user.token) {
    return { Authorization: `Bearer ${user.token}` };
  }
  return {};
};

// Generic response handler to parse JSON errors
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Server error in task API");
  }
  if (
    response.status === 204 ||
    (response.status === 200 && response.headers.get("Content-Length") === "0")
  ) {
    return null;
  }
  return response.json();
};

export const getTasks = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach((key) => {
    if (filters[key]) {
      const queryKey = key === "name" || key === "description" ? "search" : key;
      const finalKey = queryKey === "assignedUser" ? "assignedUser" : queryKey;
      params.append(finalKey, filters[key]);
    }
  });

  const queryString = params.toString() ? `?${params.toString()}` : "";
  const url = `${API_URL_BASE}${queryString}`;

  const response = await fetch(url, {
    headers: getAuthHeader(),
  });
  return handleResponse(response);
};

export const createTask = async (taskPayload) => {
  const response = await fetch(API_URL_BASE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(taskPayload),
  });
  return handleResponse(response);
};

export const deleteTaskById = async (taskId) => {
  const response = await fetch(`${API_URL_BASE}/${taskId}`, {
    method: "DELETE",
    headers: getAuthHeader(),
  });
  await handleResponse(response);
  return taskId;
};

export const updateTaskById = async (taskId, updatedFields) => {
  const response = await fetch(`${API_URL_BASE}/${taskId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader(),
    },
    body: JSON.stringify(updatedFields),
  });
  return handleResponse(response);
};

//  New timer and baseline adjustment APIs

export const startTimerAPI = async (taskId) => {
  const response = await fetch(`${API_URL_BASE}/${taskId}/start-timer`, {
    method: "PATCH",
    headers: getAuthHeader(),
  });
  return handleResponse(response);
};

export const stopTimerAPI = async (taskId) => {
  const response = await fetch(`${API_URL_BASE}/${taskId}/stop-timer`, {
    method: "PATCH",
    headers: getAuthHeader(),
  });
  return handleResponse(response);
};

export const adjustTaskTimeAPI = async (
  taskId,
  newTimeInMinutes,
  isBaselineRequest = false
) => {
  const response = await fetch(`${API_URL_BASE}/${taskId}/adjust-time`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify({
      newTimeInMinutes,
      isBaselineRequest,
    }),
  });
  return handleResponse(response);
};

export const manageBaselineRequestAPI = async (
  taskId,
  action,
  approvedTime = null
) => {
  // action is 'approve' or 'reject'
  const response = await fetch(`${API_URL_BASE}/${taskId}/manage-baseline`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", ...getAuthHeader() },
    body: JSON.stringify({
      action,
      approvedTime,
    }),
  });
  return handleResponse(response);
};
