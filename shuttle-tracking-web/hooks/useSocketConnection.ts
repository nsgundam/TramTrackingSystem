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
}

export function useSocketConnection({
  configuredBackendOrigin,
  mapRef,
  isZoomingRef,
  pendingUpdatesRef,
  processLocationUpdateRef,
}: UseSocketOptions) {
  useEffect(() => {
    const socketOrigin = configuredBackendOrigin || "http://localhost:3001";
    const socket: Socket = io(socketOrigin);

    socket.on("location-update", (data: LocationUpdateData) => {
      if (!mapRef.current) return;
      if (isZoomingRef.current) {
        const id = String(data.vehicleId || data.id);
        pendingUpdatesRef.current[id] = data;
        return;
      }
      processLocationUpdateRef.current(data);
    });

    return () => { socket.disconnect(); };
  }, [configuredBackendOrigin, mapRef, isZoomingRef, pendingUpdatesRef, processLocationUpdateRef]);
}