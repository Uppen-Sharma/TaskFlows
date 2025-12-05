// Vite sets import.meta.env.MODE to 'production' during build
const isProduction = import.meta.env.MODE === "production";

export const API_BASE_URL = isProduction
  ? "https://YOUR-RENDER-APP-NAME.onrender.com" // deploying backend URL
  : "https://localhost:5000"; // local HTTPS URL
