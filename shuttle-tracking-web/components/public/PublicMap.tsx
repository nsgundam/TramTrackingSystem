"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { io } from "socket.io-client";
import { Vehicle } from "@/types/vehicle";
import { Stop } from "@/types/stop";

const movingBusIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png",
  iconSize: [42, 42],
  iconAnchor: [21, 42],
  popupAnchor: [0, -42],
  className: "transition-transform duration-1000",
});

const stopIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2873/2873289.png",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
});

interface VehicleLocation {
  vehicleId: string;
  lat: number;
  lng: number;
  speed: number;
  station: string;
}

interface PublicMapProps {
  vehicles: Vehicle[];
  stops: Stop[];
  selectedRouteId: string | null;
}

export default function PublicMap({
  vehicles,
  stops,
  selectedRouteId,
}: PublicMapProps) {
  const [activeLocations, setActiveLocations] = useState<Record<string, VehicleLocation>>({});

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    const socket = io(socketUrl);

    socket.on("location-update", (data: VehicleLocation) => {
      setActiveLocations((prev) => ({
        ...prev,
        [data.vehicleId]: data,
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Filter vehicles visually on the map if a route is selected
  const displayedVehicles = vehicles.filter((v) => 
    selectedRouteId ? v.assignedRouteId === selectedRouteId : true
  );

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={[13.964772, 100.587563]}
        zoom={15} 
        style={{ height: "100%", width: "100%", zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        {/* Render Stops */}
        {stops.map((stop) => (
          <Marker 
            key={`stop-${stop.id}`} 
            position={[stop.lat, stop.lng]} 
            icon={stopIcon}
          >
            <Popup className="rounded-xl overflow-hidden shadow-xl border-0">
              <div className="text-center p-1 min-w-[120px]">
                <strong className="text-lg text-slate-800 block mb-1 font-semibold">{stop.nameTh}</strong>
                {stop.nameEn && <p className="text-sm text-slate-500 m-0">{stop.nameEn}</p>}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Render Live Vehicles */}
        {displayedVehicles.map((vehicle) => {
          const loc = activeLocations[vehicle.id];
          if (!loc) return null; // Hide if not transmitting yet

          const routeColor = vehicle.route?.color || "#3B82F6";

          return (
            <Marker 
              key={vehicle.id} 
              position={[loc.lat, loc.lng]} 
              icon={movingBusIcon}
            >
              <Popup className="rounded-2xl overflow-hidden p-0 border-0 shadow-2xl">
                <div className="w-48 overflow-hidden rounded-xl bg-white">
                  <div 
                    className="p-3 text-white flex justify-between items-center" 
                    style={{ backgroundColor: routeColor }}
                  >
                    <span className="font-bold text-lg">{vehicle.name}</span>
                    <span className="text-xs font-medium px-2 py-1 bg-black/20 rounded-full">
                      {vehicle.route?.name || "No Route"}
                    </span>
                  </div>
                  <div className="p-4 bg-slate-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Speed</span>
                      <span className="font-mono text-slate-800 font-semibold">{loc.speed ? loc.speed.toFixed(1) : 0} <span className="text-slate-400 text-xs">km/h</span></span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 text-xs uppercase font-bold tracking-wider">Status</span>
                      <span className="text-slate-800 text-sm font-medium">
                        {loc.station === 'En Route' ? 'กำลังวิ่ง 💨' : loc.station}
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
