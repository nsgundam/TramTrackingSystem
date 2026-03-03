"use client";

import Sidebar from "@/components/admin/Sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-50">
        {!isLoginPage && <Sidebar />}
        <main className={isLoginPage ? "h-screen w-full" : "ml-64 p-8"}>
          <div className={isLoginPage ? "w-full h-full" : "max-w-7xl mx-auto"}>
            {children}
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}