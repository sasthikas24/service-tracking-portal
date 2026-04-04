// Determine API URL based on environment
const API_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? "https://service-tracking-portal-backend.onrender.com" 
    : "http://localhost:5000");

export default API_URL;