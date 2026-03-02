"use client";

import dynamic from "next/dynamic";
import { Activity } from "lucide-react";

const LiveMap = dynamic(() => import("@/components/admin/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400">
      Loading Map...
    </div>
  ),
});

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Live Dashboard</h1>
          <p className="text-slate-500">Monitor shuttle buses in real-time</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium border border-green-200">
          <Activity size={16} className="animate-pulse" />
          Live System Active
        </div>
      </div>
      
      <LiveMap />

    </div>
  );
}