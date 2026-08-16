"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { setCookie, deleteCookie, getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import axios from "axios";
import api from "@/services/api";

export const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN", "DEV"] as const;

export type AdminRole = typeof ADMIN_ROLES[number];

export interface AdminUser {
  id: string;
  username: string;
  role: AdminRole;
}

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === "object" && value !== null
);

export const isAdminRole = (value: unknown): value is AdminRole => (
  typeof value === "string" && ADMIN_ROLES.some((role) => role === value)
);

export const isAdminUser = (value: unknown): value is AdminUser => (
  isRecord(value)
  && typeof value.id === "string"
  && value.id.trim().length > 0
  && typeof value.username === "string"
  && value.username.trim().length > 0
  && isAdminRole(value.role)
);

const userFromAuthResponse = (value: unknown): AdminUser | null => {
  if (!isRecord(value) || !isAdminUser(value.user)) return null;
  return value.user;
};

interface AuthContextType {
  user: AdminUser | null;
  token: string | null;
  login: (token: unknown, userData: unknown) => void;
  reauthenticate: (password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
  reauthenticate: async () => {},
  logout: () => {},
  isAuthenticated: false,
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const logout = useCallback(() => {
    deleteCookie("admin_token");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
    router.push("/admin/login");
  }, [router]);

  const setSession = useCallback((newToken: unknown, userData: unknown): boolean => {
    if (
      typeof newToken !== "string"
      || newToken.trim().length === 0
      || !isAdminUser(userData)
    ) {
      return false;
    }

    setCookie("admin_token", newToken, { maxAge: 60 * 60 * 24 });
    setToken(newToken);
    setUser(userData);
    axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    return true;
  }, []);

  useEffect(() => {
    const storedToken = getCookie("admin_token") as string;
    let active = true;
    
    if (storedToken) {
      try {
        const decoded = jwtDecode<{ exp?: number }>(storedToken);
        if (typeof decoded.exp !== "number" || decoded.exp * 1000 < Date.now()) {
          setTimeout(() => logout(), 0);
        } else {
          axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
          void api.get<unknown>("auth/me")
            .then((response) => {
              if (!active) return;

              const authenticatedUser = userFromAuthResponse(response.data);
              if (!authenticatedUser || !setSession(storedToken, authenticatedUser)) {
                logout();
              }
            })
            .catch(() => {
              if (active) logout();
            })
            .finally(() => {
              if (active) setIsLoading(false);
            });
          return () => {
            active = false;
          };
        }
      } catch (error) {
        console.error("Invalid token", error);
        setTimeout(() => logout(), 0);
      }
    }
    const loadingTimer = window.setTimeout(() => {
      if (active) setIsLoading(false);
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(loadingTimer);
    };
  }, [logout, setSession]);

  const login = (newToken: unknown, userData: unknown) => {
    if (!setSession(newToken, userData)) {
      logout();
      throw new Error("Invalid authentication response");
    }
    router.push("/admin/dashboard");
  };

  const reauthenticate = async (password: string): Promise<void> => {
    const response = await api.post<unknown>("auth/reauthenticate", { password });
    if (!isRecord(response.data) || !setSession(response.data.token, response.data.user)) {
      logout();
      throw new Error("Invalid authentication response");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        reauthenticate,
        logout,
        isAuthenticated: !!token,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
