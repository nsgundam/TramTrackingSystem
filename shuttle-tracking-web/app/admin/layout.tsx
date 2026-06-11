"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

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
      <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
        {!isLoginPage && (
          <>
            {/* Mobile Header */}
            <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 text-white flex items-center justify-between px-4 z-40 border-b border-slate-800 shadow-sm">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 -ml-2 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors focus:outline-none"
                  aria-label="Open sidebar"
                >
                  <Menu size={24} />
                </button>
                <span className="font-bold text-lg text-blue-400">Shuttle Admin</span>
              </div>
              <div className="text-xs text-slate-400 font-medium">Management</div>
            </header>

            {/* Sidebar Backdrop Overlay on Mobile */}
            {isSidebarOpen && (
              <div
                onClick={() => setIsSidebarOpen(false)}
                className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity duration-300"
              />
            )}

            {/* Sidebar drawer */}
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
          </>
        )}

        <main
          className={
            isLoginPage
              ? "h-screen w-full"
              : "flex-1 min-w-0 pt-16 lg:pt-0 lg:ml-64 min-h-screen transition-all duration-300"
          }
        >
          <div className={isLoginPage ? "w-full h-full" : "p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto"}>
            {children}
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}