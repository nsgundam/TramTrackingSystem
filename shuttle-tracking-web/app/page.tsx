"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Shield, MapPin, Bus, Navigation } from "lucide-react";
import publicApi from "@/services/publicApi";
import { Vehicle } from "@/types/vehicle";
import { Route } from "@/types/route";
import { Stop } from "@/types/stop";

// Dynamically load the map so leaflet window code doesn't break SSR
const PublicMap = dynamic(() => import("@/components/public/PublicMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-slate-100 animate-pulse flex items-center justify-center text-slate-400 flex-col gap-4">
      <Navigation className="animate-bounce w-12 h-12 text-blue-400" />
      <p className="font-semibold tracking-wide">กำลังโหลดแผนที่...</p>
    </div>
  ),
});

export default function PublicTrackingPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [stops, setStops] = useState<Stop[]>([]);
  
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  const fetchPublicData = async () => {
    try {
      setLoading(true);
      
      const [routesRes, vehiclesRes, stopsRes] = await Promise.all([
        publicApi.get("/public/active-routes"),
        publicApi.get("/public/active-vehicles"),
        publicApi.get("/public/stops"),
      ]);

      setRoutes(routesRes.data);
      setVehicles(vehiclesRes.data);
      setStops(stopsRes.data);
    } catch (error) {
      console.error("Failed to fetch tracking data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Switch stops displayed based on route click
  const fetchRouteStops = async (routeId: string) => {
    try {
      const res = await publicApi.get(`/public/routes/${routeId}/stops`);
      setStops(res.data);
    } catch (error) {
      console.error("Failed to fetch route stops:", error);
    }
  };

  const handleRouteClick = (routeId: string) => {
    if (selectedRouteId === routeId) {
      setSelectedRouteId(null);
      fetchPublicData(); // User deselected, fetch all general stops again
    } else {
      setSelectedRouteId(routeId);
      fetchRouteStops(routeId);
    }
  };

  useEffect(() => {
    fetchPublicData();
  }, []);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden relative font-sans">
      {/* 1. Floating Map Underneath */}
      <div className="absolute inset-0 z-0">
        <PublicMap 
          vehicles={vehicles} 
          stops={stops} 
          selectedRouteId={selectedRouteId} 
        />
      </div>

      {/* 2. Glassmorphism Sidebar Header overlapping */}
      <div className="absolute top-0 left-0 bottom-0 z-10 w-full md:w-96 p-4 pointer-events-none flex flex-col gap-4">
        
        {/* Branding App Bar */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-2xl rounded-3xl p-6 pointer-events-auto transition-all">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <Bus className="text-blue-600" size={28} />
                Shuttle Track
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-1">Live University Transit System</p>
            </div>
            <Link 
              href="/admin/login"
              className="p-2 bg-slate-100 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-colors shrink-0"
              title="Admin Login"
            >
              <Shield size={20} />
            </Link>
          </div>
        </div>

        {/* Route Selector List */}
        <div className="bg-white/90 backdrop-blur-2xl border border-white/50 shadow-2xl rounded-3xl p-6 pointer-events-auto flex-1 overflow-y-auto hidden md:flex flex-col gap-4">
          <div className="flex items-center justify-between opacity-80 mb-2">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500">Active Routes</h2>
            <div className="flex items-center gap-2 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Live
            </div>
          </div>

          {loading ? (
             <div className="flex justify-center items-center py-10 opacity-50">
                <Navigation className="animate-pulse w-8 h-8 text-blue-400" />
             </div>
          ) : routes.length > 0 ? (
            <div className="flex flex-col gap-3">
              {routes.map(route => {
                const isSelected = selectedRouteId === route.id;
                
                return (
                  <button
                    key={route.id}
                    onClick={() => handleRouteClick(route.id)}
                    className={`w-full text-left p-4 rounded-2xl transition-all duration-300 border-2 overflow-hidden relative group ${
                      isSelected 
                        ? "bg-blue-50/50 shadow-md transform scale-[1.02]" 
                        : "bg-white hover:bg-slate-50 border-transparent hover:border-slate-200"
                    }`}
                    style={{ 
                      borderColor: isSelected ? route.color : 'transparent',
                    }}
                  >
                    {isSelected && (
                      <div className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: route.color }}></div>
                    )}
                    <div className="flex items-center gap-3">
                       <div 
                         className={`w-4 h-4 rounded-full transition-transform ${isSelected ? 'scale-110 shadow-lg' : ''}`} 
                         style={{ backgroundColor: route.color }} 
                       />
                       <span className={`font-semibold ${isSelected ? 'text-slate-900' : 'text-slate-600 group-hover:text-slate-800'}`}>
                         {route.name}
                       </span>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-slate-400 text-sm font-medium">ไม่มีเส้นทางที่ให้บริการในขณะนี้</p>
            </div>
          )}

          {/* Quick Stats Panel */}
          <div className="mt-auto pt-6 border-t border-slate-100 flex justify-between px-2">
             <div className="text-center">
                <span className="block text-2xl font-black text-slate-800">{vehicles.length}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Buses</span>
             </div>
             <div className="text-center">
                <span className="block text-2xl font-black text-slate-800">{stops.length}</span>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{selectedRouteId ? "Route Stops" : "Total Stops"}</span>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}