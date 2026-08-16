"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";
import { isAdminRole, useAuth } from "@/contexts/AuthContext";
import { useModalFocus } from "@/hooks/useModalFocus";
import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard, 
  Bus, 
  Map as MapIcon, 
  MapPin, 
  MessageSquare,
  Radio,
  LogOut,
  X
} from "lucide-react";

interface MenuItem {
  title: string;
  path: string;
  icon: LucideIcon;
  minimumRole?: "ADMIN" | "SUPER_ADMIN";
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Vehicles",
    path: "/admin/vehicles",
    icon: Bus,
  },
  {
    title: "Routes",
    path: "/admin/routes",
    icon: MapIcon,
  },
  {
    title: "Stops",
    path: "/admin/stops",
    icon: MapPin,
  },
  {
    title: "Source Health",
    path: "/admin/devices",
    icon: Radio,
    minimumRole: "ADMIN",
  },
  {
    title: "Feedback Inbox",
    path: "/admin/feedback",
    icon: MessageSquare,
    minimumRole: "SUPER_ADMIN",
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOBILE_VIEWPORT_QUERY = "(max-width: 1023px)";
const subscribeToMobileViewport = (onChange: () => void) => {
  const mediaQuery = window.matchMedia(MOBILE_VIEWPORT_QUERY);
  mediaQuery.addEventListener("change", onChange);
  return () => mediaQuery.removeEventListener("change", onChange);
};
const getMobileViewportSnapshot = () => window.matchMedia(MOBILE_VIEWPORT_QUERY).matches;
const getServerMobileViewportSnapshot = () => false;

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const isMobileViewport = useSyncExternalStore(
    subscribeToMobileViewport,
    getMobileViewportSnapshot,
    getServerMobileViewportSnapshot,
  );
  const roleRank = { ADMIN: 1, SUPER_ADMIN: 2, DEV: 3 } as const;
  const canAccess = (minimumRole?: "ADMIN" | "SUPER_ADMIN") =>
    !minimumRole || Boolean(user && isAdminRole(user.role) && roleRank[user.role] >= roleRank[minimumRole]);
  const isMobileDialogOpen = isMobileViewport && isOpen;
  const isMobileHidden = isMobileViewport && !isOpen;
  const sidebarRef = useModalFocus<HTMLElement>({
    active: isMobileDialogOpen,
    onClose,
    initialFocusSelector: "[data-modal-initial-focus]",
  });

  return (
    <aside
      ref={sidebarRef}
      id="admin-sidebar"
      inert={isMobileHidden}
      aria-hidden={isMobileHidden ? true : undefined}
      role={isMobileDialogOpen ? "dialog" : undefined}
      aria-modal={isMobileDialogOpen ? true : undefined}
      aria-label={isMobileDialogOpen ? "Admin navigation" : undefined}
      tabIndex={isMobileDialogOpen ? -1 : undefined}
      className="admin-sidebar"
      data-open={isOpen}
      data-admin-material="glass"
    >
      <div className="admin-sidebar__brand">
        <div className="admin-sidebar__identity">
          <span className="admin-sidebar__mark" aria-hidden="true">RSU</span>
          <div>
            <p className="admin-sidebar__brand-title">RSU Operations</p>
            <p className="admin-sidebar__brand-subtitle">Transport control</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="admin-sidebar__close"
          aria-label="Close sidebar"
          data-modal-initial-focus
        >
          <X size={20} aria-hidden="true" />
        </button>
      </div>

      <nav aria-label="Admin" className="admin-sidebar__nav">
        <p className="admin-sidebar__section-label">Workspace</p>
        <div className="admin-sidebar__links">
          {menuItems.filter((item) => canAccess(item.minimumRole)).map((item) => {
            const isActive = pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={onClose}
                aria-current={isActive ? "page" : undefined}
                className="admin-sidebar__link"
              >
                <Icon size={19} aria-hidden="true" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="admin-sidebar__footer">
        {user && isAdminRole(user.role) && (
          <div className="admin-sidebar__user">
            <p className="admin-sidebar__username">{user.username}</p>
            <p className="admin-sidebar__user-role">{user.role.replaceAll("_", " ")}</p>
          </div>
        )}
        <button
          type="button"
          onClick={() => {
            onClose();
            logout(); 
          }}
          className="admin-sidebar__logout"
        >
          <LogOut size={19} aria-hidden="true" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
