"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { setCookie, deleteCookie, getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import axios from "axios";
import api from "@/services/api";

export type AdminRole = "ADMIN" | "SUPER_ADMIN" | "DEV";

interface User {
  id: string;
  username: string;
  role: AdminRole;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
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
  const [user, setUser] = useState<User | null>(null);
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

  const setSession = useCallback((newToken: string, userData: User) => {
    setCookie("admin_token", newToken, { maxAge: 60 * 60 * 24 });
    setToken(newToken);
    setUser(userData);
    axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
  }, []);

  useEffect(() => {
    const storedToken = getCookie("admin_token") as string;
    let active = true;
    
    if (storedToken) {
      try {
        const decoded = jwtDecode<{exp: number, userId: string, username: string}>(storedToken);
        if (decoded.exp * 1000 < Date.now()) {
          setTimeout(() => logout(), 0);
        } else {
          axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
          void api.get("auth/me")
            .then((response) => {
              if (active) {
                setToken(storedToken);
                setUser(response.data.user as User);
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
  }, [logout]);

  const login = (newToken: string, userData: User) => {
    setSession(newToken, userData);
    router.push("/admin/dashboard");
  };

  const reauthenticate = async (password: string): Promise<void> => {
    const response = await api.post("auth/reauthenticate", { password });
    setSession(response.data.token as string, response.data.user as User);
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
