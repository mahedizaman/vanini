import axios from "axios";
import useAuthStore from "../store/authStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: true,
});

const tokenFromStorage =
  typeof window !== "undefined" ? window.localStorage.getItem("admin_token") : null;
if (tokenFromStorage) {
  api.defaults.headers.common.Authorization = `Bearer ${tokenFromStorage}`;
}

api.interceptors.request.use((config) => {
  const token =
    useAuthStore.getState().accessToken ||
    (typeof window !== "undefined" ? window.localStorage.getItem("admin_token") : null);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true;
      try {
        const refreshResponse = await api.post("/auth/refresh-token");
        const newToken = refreshResponse.data?.accessToken;

        if (newToken) {
          useAuthStore.getState().setAccessToken(newToken);
          api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
