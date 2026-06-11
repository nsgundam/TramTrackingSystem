"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Activity, Bus, Map, MapPin, Loader2 } from "lucide-react";
import api from "@/services/api";
import { Vehicle } from "@/types/vehicle";

const LiveMap = dynamic(() => import("@/components/admin/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400">
      Loading Map...
    </div>
  ),
});

export default function DashboardPage() {
  const [stats, setStats] = useState({
    activeVehicles: 0,
    totalRoutes: 0,
    totalStops: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const [vehiclesRes, routesRes, stopsRes] = await Promise.all([
          api.get("admin/vehicles"),
          api.get("admin/routes"),
          api.get("admin/stops"),
        ]);
        
        const activeVehiclesCount = (vehiclesRes.data as Vehicle[] || []).filter(
          (v) => v.status === "active"
        ).length;

        setStats({
          activeVehicles: activeVehiclesCount,
          totalRoutes: (routesRes.data || []).length,
          totalStops: (stopsRes.data || []).length,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            Live Dashboard
          </h1>
          <p className="text-slate-500 font-medium">Monitor shuttle buses in real-time</p>
        </div>
        <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 text-emerald-700 rounded-full text-sm font-semibold border border-emerald-200/60 shadow-xs">
          <Activity size={16} className="animate-pulse text-emerald-500" />
          Live System Active
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Vehicles Card */}
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl -mr-8 -mt-8" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Vehicles</p>
              {loading ? (
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mt-2" />
              ) : (
                <h3 className="text-3xl font-extrabold text-slate-900 mt-2 font-display">{stats.activeVehicles}</h3>
              )}
            </div>
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-xl shadow-xs">
              <Bus size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 font-medium">Currently active & tracking</p>
        </div>

        {/* Total Routes Card */}
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl -mr-8 -mt-8" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Routes</p>
              {loading ? (
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mt-2" />
              ) : (
                <h3 className="text-3xl font-extrabold text-slate-900 mt-2 font-display">{stats.totalRoutes}</h3>
              )}
            </div>
            <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-xl shadow-xs">
              <Map size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 font-medium">Configured shuttle lines</p>
        </div>

        {/* Total Stops Card */}
        <div className="relative overflow-hidden bg-white/70 backdrop-blur-md border border-slate-200/60 rounded-2xl p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -mr-8 -mt-8" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Transit Stops</p>
              {loading ? (
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mt-2" />
              ) : (
                <h3 className="text-3xl font-extrabold text-slate-900 mt-2 font-display">{stats.totalStops}</h3>
              )}
            </div>
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-xl shadow-xs">
              <MapPin size={24} />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-4 font-medium">Designated picking spots</p>
        </div>
      </div>

      {/* Live Map Component */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-1 shadow-xs overflow-hidden">
        <LiveMap />
      </div>
    </div>
  );
}