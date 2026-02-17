"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Bus, 
  Map as MapIcon, 
  MapPin, 
  LogOut 
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

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-white h-screen flex flex-col fixed left-0 top-0 overflow-y-auto">
      {/* 1. Logo Section */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-blue-400">Shuttle Admin</h1>
        <p className="text-xs text-slate-400 mt-1">Management System</p>
      </div>

      {/* 2. Menu Items */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.path);
          return (
            <Link
              key={item.path}
              href={item.path}
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
            // เดี๋ยวค่อยใส่ Logic Logout ทีหลัง
            window.location.href = "/admin/login"; 
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