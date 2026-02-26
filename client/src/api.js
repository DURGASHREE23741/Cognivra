import axios from "axios";

// In production, set VITE_API_BASE to your backend URL (e.g. https://cognivra-api.onrender.com)
const baseURL = import.meta.env.VITE_API_BASE || "";

export const api = axios.create({
  baseURL,
  timeout: 65000,
  headers: { "Content-Type": "application/json" },
});
