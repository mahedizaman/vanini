import axios from "axios";
import useAuthStore from "@/store/authStore";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

function isRefreshRequest(config) {
  const url = config?.url || "";
  return url.includes("/auth/refresh-token");
}

function isLoginRequest(config) {
  const url = config?.url || "";
  return url.includes("/auth/login") || url.includes("/auth/register");
}

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest?._retry && !isRefreshRequest(originalRequest)) {
      if (isLoginRequest(originalRequest)) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      try {
        const refreshResponse = await api.post("/auth/refresh-token");
        const newToken = refreshResponse.data?.accessToken;

        if (newToken) {
          useAuthStore.getState().setAccessToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        useAuthStore.getState().logout();
        if (typeof window !== "undefined") {
          const { default: toast } = await import("react-hot-toast");
          toast.error("Session expired. Please sign in again.");
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
