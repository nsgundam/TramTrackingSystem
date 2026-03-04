"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { io } from "socket.io-client";

const busIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

interface VehicleLocation {
  vehicleId: string;
  lat: number;
  lng: number;
  speed: number;
  station: string;
}

export default function LiveMap() {
  const [activeVehicles, setActiveVehicles] = useState<Record<string, VehicleLocation>>({});

  useEffect(() => {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    const socket = io(socketUrl);

    socket.on("location-update", (data: VehicleLocation) => {
      console.log("📍 Received Data:", data);
      
      setActiveVehicles((prev) => ({
        ...prev,
        [data.vehicleId]: data,
      }));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden border border-slate-200 shadow-sm z-0 relative">
      <MapContainer 
        center={[13.964772, 100.587563]}
        zoom={15} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {Object.values(activeVehicles).map((vehicle) => (
          <Marker 
            key={vehicle.vehicleId} 
            position={[vehicle.lat, vehicle.lng]} 
            icon={busIcon}
          >
            <Popup>
              <div className="text-center">
                <strong className="text-lg text-blue-600 block mb-1">{vehicle.vehicleId}</strong>
                <p className="text-sm m-0">Speed: {vehicle.speed ? vehicle.speed.toFixed(1) : 0} km/h</p>
                <p className="text-xs text-slate-500 m-0 mt-1">
                  Station: {vehicle.station === 'En Route' ? 'กำลังวิ่ง 💨' : vehicle.station}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}