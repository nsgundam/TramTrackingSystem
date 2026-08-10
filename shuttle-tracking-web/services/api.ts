import axios, { type AxiosError } from "axios";
import { getCookie, deleteCookie } from "cookies-next";
import { backendConnection } from "@/config/backend";

const api = axios.create({
  baseURL: backendConnection.apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

const isAdminLoginRequest = (requestUrl: string | undefined): boolean => (
  typeof requestUrl === "string" && /(?:^|\/)auth\/login(?:\?|$)/.test(requestUrl)
);

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
  (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      if (typeof window !== "undefined") {
        deleteCookie("admin_token");
        if (!isAdminLoginRequest(error.config?.url)) {
          window.location.href = "/admin/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
