import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL?.trim() || "https://test-backend-production-9179.up.railway.app/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("ttm_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
