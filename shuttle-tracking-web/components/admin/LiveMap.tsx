"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { io, Socket } from "socket.io-client";
import { getActiveVehicles } from "@/services/publicApi";
import {
  CanonicalVehicleStateV1,
  RealtimeConnectionState,
  isCanonicalStateNewer,
} from "@/types";

const busIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

export default function LiveMap() {
  const [activeVehicles, setActiveVehicles] = useState<Record<string, CanonicalVehicleStateV1>>({});
  const [connectionState, setConnectionState] = useState<RealtimeConnectionState>("disconnected");
  const versionsRef = useRef<Record<string, Pick<CanonicalVehicleStateV1, "stateEpoch" | "stateVersion">>>({});
  const hasConnectedRef = useRef(false);

  useEffect(() => {
    const configuredBackendOrigin =
      process.env.NEXT_PUBLIC_BACKEND_URL ||
      (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api").replace(/\/api\/?$/, "");
    const socketUrl = configuredBackendOrigin;
    let disposed = false;
    let socket: Socket | null = null;

    const acceptState = (state: CanonicalVehicleStateV1): boolean => {
      const previous = versionsRef.current[state.vehicleId];
      if (!isCanonicalStateNewer(state, previous)) return false;
      versionsRef.current[state.vehicleId] = {
        stateEpoch: state.stateEpoch,
        stateVersion: state.stateVersion,
      };
      setActiveVehicles((current) => ({ ...current, [state.vehicleId]: state }));
      return true;
    };

    const hydrate = async () => {
      const vehicles = await getActiveVehicles(configuredBackendOrigin);
      vehicles.forEach((vehicle) => acceptState(vehicle.state));
    };

    const connectAfterSnapshot = async () => {
      await hydrate();
      if (disposed) return;

      socket = io(socketUrl, { autoConnect: false });
      socket.on("connect", () => {
        setConnectionState("connected");
        if (hasConnectedRef.current) void hydrate();
        hasConnectedRef.current = true;
      });
      socket.on("disconnect", () => setConnectionState("disconnected"));
      socket.on("connect_error", () => setConnectionState("reconnecting"));
      socket.io.on("reconnect_attempt", () => setConnectionState("reconnecting"));
      socket.on("location-update", (state: CanonicalVehicleStateV1) => acceptState(state));
      socket.connect();
    };

    void connectAfterSnapshot().catch(() => setConnectionState("disconnected"));
    return () => {
      disposed = true;
      socket?.disconnect();
    };
  }, []);

  const stateCounts = Object.values(activeVehicles).reduce<Record<CanonicalVehicleStateV1["serviceState"], number>>(
    (counts, state) => {
      counts[state.serviceState] += 1;
      return counts;
    },
    { live: 0, stale: 0, no_service: 0, unknown: 0 },
  );

  return (
    <div className="w-full h-125 rounded-xl overflow-hidden border border-slate-200 shadow-sm z-0 relative">
      <div className="absolute top-3 right-3 z-1000 rounded-full bg-white/90 px-3 py-1 text-xs text-slate-600 shadow">
        {connectionState === "connected" && "Connected"}
        {connectionState === "reconnecting" && "Reconnecting"}
        {connectionState === "disconnected" && "Disconnected"}
      </div>
      <div
        aria-label="Vehicle service state summary"
        className="absolute top-11 right-3 z-1000 rounded-lg bg-white/90 px-3 py-2 text-[11px] leading-5 text-slate-600 shadow"
      >
        <div>Live: {stateCounts.live}</div>
        <div>Last known: {stateCounts.stale}</div>
        <div>No service: {stateCounts.no_service}</div>
        <div>Unavailable: {stateCounts.unknown}</div>
      </div>
      <MapContainer
        center={[13.964772, 100.587563]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {Object.values(activeVehicles).map((state) => {
          const location = state.serviceState === "live"
            ? state.liveLocation
            : state.serviceState === "stale"
              ? state.lastKnownLocation
              : null;
          if (!location) return null;
          return (
            <Marker
              key={`${state.vehicleId}:${state.stateEpoch}:${state.stateVersion}`}
              position={[location.lat, location.lng]}
              icon={busIcon}
              opacity={state.serviceState === "stale" ? 0.55 : 1}
            >
              <Popup>
                <div className="text-center">
                  <strong className="text-lg text-blue-600 block mb-1">{state.vehicleId}</strong>
                  <p className="text-sm m-0">State: {state.serviceState}</p>
                  <p className="text-sm m-0">Route: {state.routeId || "Unknown"}</p>
                  <p className="text-sm m-0">Speed: {location.speed ?? 0} km/h</p>
                  <p className="text-xs text-slate-500 m-0 mt-1">
                    {state.serviceState === "stale" ? "Last known location — ETA unavailable" : location.station || "No station"}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
