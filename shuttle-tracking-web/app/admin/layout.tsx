"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import "./admin.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AuthProvider>
      {isLoginPage ? (
        <main lang="en" className="h-screen w-full">
          <div className="h-full w-full">{children}</div>
        </main>
      ) : (
        <div className="admin-shell" data-admin-theme="rsu-operations">
          <header className="admin-mobile-header">
            <div className="admin-mobile-header__brand">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="admin-mobile-header__button"
                aria-label="Open sidebar"
                aria-controls="admin-sidebar"
                aria-expanded={isSidebarOpen}
              >
                <Menu size={22} aria-hidden="true" />
              </button>
              <span className="admin-mobile-header__title">RSU Operations</span>
            </div>
            <span className="admin-mobile-header__context">Admin console</span>
          </header>

          {isSidebarOpen && (
            <div
              onClick={() => setIsSidebarOpen(false)}
              aria-hidden="true"
              className="admin-sidebar-backdrop"
            />
          )}

          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

          <main lang="en" className="admin-shell__main">
            <div className="admin-shell__content">{children}</div>
          </main>
        </div>
      )}
    </AuthProvider>
  );
}
