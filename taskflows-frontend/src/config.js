// If Vercel provides a custom URL, use it. Otherwise, default to local.
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
