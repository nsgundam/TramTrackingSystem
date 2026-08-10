"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import { AuthProvider } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import "./admin.css";

const ADMIN_DESIGN_CONTRACT = `THESIS: Operational truth on a quiet luminous plane; reject flat generic enterprise chrome, colored-theme spectacle, and glass applied indiscriminately.
OWN-WORLD: White, porcelain, and soft frost-gray field; regular light glass for navigation, context controls, and modal chrome; opaque white and graphite material for operational content; concentric geometry; system UI type; blue only for functional action, selection, focus, and existing status meaning.
STORY: The operator recognizes the secure RSU workspace, sees current context and actions in the glass layer, then reads verified operational content on stable opaque surfaces.
FIRST VIEWPORT: Desktop floats a compact white-glass navigation rail beside a spacious pale-gray operational canvas; Mobile uses one white-glass top capsule and drawer; Login uses the same light-neutral material grammar and one clear primary action.
FORM: Signal Lens Workbench, third grounded direction; seed 7c756d3a.
FINISH: Unreviewed and undocumented is unfinished; this build ends with the finish review, verdict, and DESIGN.md.`;

function AdminDesignContract() {
  return (
    <template
      data-admin-design-contract
      dangerouslySetInnerHTML={{ __html: ADMIN_DESIGN_CONTRACT }}
    />
  );
}

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
        <main lang="en" className="admin-login-shell" data-admin-theme="signal-lens">
          <AdminDesignContract />
          <div className="admin-login-shell__content">{children}</div>
        </main>
      ) : (
        <div className="admin-shell" data-admin-theme="signal-lens">
          <AdminDesignContract />
          <header className="admin-mobile-header" data-admin-material="glass">
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
