import axios from "axios";
import { getCookie, deleteCookie } from "cookies-next";
import { backendConnection } from "@/config/backend";

const api = axios.create({
  baseURL: backendConnection.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = getCookie("admin_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (typeof window !== "undefined") {
        deleteCookie("admin_token");
        window.location.href = "/admin/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
