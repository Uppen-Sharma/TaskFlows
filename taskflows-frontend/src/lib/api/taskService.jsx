// taskflows-frontend/src/lib/api/taskService.jsx

// Use the correct backend URL for data endpoints
const API_URL_BASE = "http://localhost:5000/api/data/tasks";

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

/**
 * Fetches tasks with optional filtering, searching, and sorting via URL query parameters.
 * @param {object} filters - Object containing status, assignedUser, search, and sort fields.
 */
export const getTasks = async (filters = {}) => {
  // Build the query string from the filters object
  const params = new URLSearchParams();
  Object.keys(filters).forEach((key) => {
    if (filters[key]) {
      // Only append if value is not null/empty/undefined
      // Backend expects 'search' query for the name/description filter
      const queryKey = key === "name" || key === "description" ? "search" : key;

      // Backend expects 'assignedUser' query for the user filter
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

// --- NEW SERVER-SIDE TIME TRACKING API CALLS ---

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
