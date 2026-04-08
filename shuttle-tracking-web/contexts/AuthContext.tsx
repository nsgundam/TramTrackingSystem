"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { setCookie, deleteCookie, getCookie } from "cookies-next";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/navigation";
import axios from "axios";

interface User {
  id: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (token: string, userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: () => {},
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

  useEffect(() => {
    const storedToken = getCookie("admin_token") as string;
    
    if (storedToken) {
      try {
        const decoded = jwtDecode<{exp: number, userId: string, username: string}>(storedToken);
        if (decoded.exp * 1000 < Date.now()) {
          setTimeout(() => logout(), 0);
        } else {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setToken(storedToken);
          setUser({ id: decoded.userId, username: decoded.username });
          axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error("Invalid token", error);
        setTimeout(() => logout(), 0);
      }
    }
    setIsLoading(false);
  }, [logout]);

  const login = (newToken: string, userData: User) => {
    setCookie("admin_token", newToken, { maxAge: 60 * 60 * 24 });
    setToken(newToken);
    setUser(userData);
    axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
    router.push("/admin/dashboard");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
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
