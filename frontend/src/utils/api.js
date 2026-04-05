// Determine API URL based on environment
const API_URL =
  import.meta.env.VITE_API_URL?.trim() ||
  (import.meta.env.DEV
    ? "http://localhost:5000"
    : "https://service-tracking-portal.onrender.com");

export default API_URL;