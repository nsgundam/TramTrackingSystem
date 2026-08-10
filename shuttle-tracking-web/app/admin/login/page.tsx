"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Bus, Map, Shield } from "lucide-react";
import api from "@/services/api";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await api.post("auth/login", {
        username,
        password,
      });

      const { token, user } = response.data;
      login(token, user);
    } catch (err: unknown) {
      const apiError = err as { response?: { data?: { error?: string } } };
      setError(apiError.response?.data?.error || "Failed to login. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <section className="admin-login__panel" aria-labelledby="admin-login-title" data-admin-material="glass">
        <div className="admin-login__brand">
          <div className="admin-login__mark" aria-hidden="true">
            <Shield size={30} />
          </div>
          <h1 id="admin-login-title" className="admin-login__title">Admin Portal</h1>
          <p className="admin-login__description">
            Sign in to manage the Tram Tracking System
          </p>
        </div>

        {error && (
          <div role="alert" className="admin-login__alert">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="admin-login__form" aria-busy={isLoading}>
          <div className="admin-login__field">
            <label htmlFor="admin-username">
              Username
            </label>
            <input
              id="admin-username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="admin-login__control"
              placeholder="Enter your username"
            />
          </div>

          <div className="admin-login__field">
            <label htmlFor="admin-password">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="admin-login__control"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="admin-login__submit"
            data-loading={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="admin-login__capabilities">
          <span><Bus size={16} aria-hidden="true" /> Live Tracking</span>
          <span><Map size={16} aria-hidden="true" /> Route Management</span>
        </div>
      </section>
    </div>
  );
}
