"use client";
import { useEffect } from "react";
import L from "leaflet";
import { io, Socket } from "socket.io-client";
import { LocationUpdateData } from "@/types";

interface UseSocketOptions {
  configuredBackendOrigin?: string;
  mapRef: React.RefObject<L.Map | null>;
  isZoomingRef: React.MutableRefObject<boolean>;
  pendingUpdatesRef: React.MutableRefObject<Record<string, LocationUpdateData>>;
  processLocationUpdateRef: React.MutableRefObject<(data: LocationUpdateData) => void>;
  hydrateActiveVehicles: () => Promise<void>;
  acceptCanonicalState: (data: LocationUpdateData) => boolean;
}

export function useSocketConnection({
  configuredBackendOrigin,
  mapRef,
  isZoomingRef,
  pendingUpdatesRef,
  processLocationUpdateRef,
  hydrateActiveVehicles,
  acceptCanonicalState,
}: UseSocketOptions) {
  useEffect(() => {
    const socketOrigin = configuredBackendOrigin || "http://localhost:3001";
    let disposed = false;
    let socket: Socket | null = null;
    let hasConnected = false;

    const connectAfterSnapshot = async () => {
      try {
        await hydrateActiveVehicles();
      } catch {
        // The socket can still recover if the initial REST snapshot is unavailable.
      }
      if (disposed) return;

      socket = io(socketOrigin, { autoConnect: false });
      socket.on("connect", () => {
        if (hasConnected) void hydrateActiveVehicles();
        hasConnected = true;
      });
      socket.on("location-update", (data: LocationUpdateData) => {
        if (!acceptCanonicalState(data) || !mapRef.current) return;
        if (isZoomingRef.current) {
          pendingUpdatesRef.current[data.vehicleId] = data;
          return;
        }
        processLocationUpdateRef.current(data);
      });
      socket.connect();
    };

    void connectAfterSnapshot();
    return () => {
      disposed = true;
      socket?.disconnect();
    };
  }, [
    configuredBackendOrigin,
    mapRef,
    isZoomingRef,
    pendingUpdatesRef,
    processLocationUpdateRef,
    hydrateActiveVehicles,
    acceptCanonicalState,
  ]);
}
