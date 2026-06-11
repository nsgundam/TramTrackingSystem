"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  Bus, 
  Map as MapIcon, 
  MapPin, 
  LogOut,
  X
} from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    path: "/admin/dashboard",
    icon: <LayoutDashboard size={20} />,
  },
  {
    title: "Vehicles",
    path: "/admin/vehicles",
    icon: <Bus size={20} />,
  },
  {
    title: "Routes",
    path: "/admin/routes",
    icon: <MapIcon size={20} />,
  },
  {
    title: "Stops",
    path: "/admin/stops",
    icon: <MapPin size={20} />,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside 
      className={`w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 overflow-y-auto z-50 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      {/* 1. Logo Section */}
      <div className="p-6 border-b border-slate-800 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-blue-400">Shuttle Admin</h1>
          <p className="text-xs text-slate-400 mt-1">Management System</p>
        </div>
        {/* Close Button for Mobile Drawer */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors focus:outline-none"
          aria-label="Close sidebar"
        >
          <X size={20} />
        </button>
      </div>

      {/* 2. Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>

      {/* 3. Logout Button */}
      <div className="p-4 border-t border-slate-800">
        <button 
          onClick={() => {
            onClose();
            logout(); 
          }}
          className="flex items-center gap-3 px-4 py-3 w-full text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
}