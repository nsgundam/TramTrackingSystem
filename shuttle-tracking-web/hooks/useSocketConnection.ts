"use client";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { io, Socket } from "socket.io-client";
import { backendConnection } from "@/config/backend";
import { LocationUpdateData, RealtimeConnectionState } from "@/types";

interface UseSocketOptions {
  mapRef: React.RefObject<L.Map | null>;
  isZoomingRef: React.MutableRefObject<boolean>;
  pendingUpdatesRef: React.MutableRefObject<Record<string, LocationUpdateData>>;
  processLocationUpdateRef: React.MutableRefObject<(data: LocationUpdateData) => void>;
  hydrateActiveVehicles: () => Promise<void>;
  acceptCanonicalState: (data: LocationUpdateData) => boolean;
}

export function useSocketConnection({
  mapRef,
  isZoomingRef,
  pendingUpdatesRef,
  processLocationUpdateRef,
  hydrateActiveVehicles,
  acceptCanonicalState,
}: UseSocketOptions) {
  const [connectionState, setConnectionState] = useState<RealtimeConnectionState>("reconnecting");
  const hydrateActiveVehiclesRef = useRef(hydrateActiveVehicles);
  const acceptCanonicalStateRef = useRef(acceptCanonicalState);

  useEffect(() => {
    hydrateActiveVehiclesRef.current = hydrateActiveVehicles;
  }, [hydrateActiveVehicles]);

  useEffect(() => {
    acceptCanonicalStateRef.current = acceptCanonicalState;
  }, [acceptCanonicalState]);

  useEffect(() => {
    let disposed = false;
    let socket: Socket | null = null;
    let hasConnected = false;

    const connectAfterSnapshot = async () => {
      try {
        await hydrateActiveVehiclesRef.current();
      } catch {
        // The socket can still recover if the initial REST snapshot is unavailable.
      }
      if (disposed) return;

      socket = io(backendConnection.socketOrigin, { autoConnect: false });
      socket.on("connect", () => {
        if (disposed) return;
        setConnectionState("connected");
        if (hasConnected) void hydrateActiveVehiclesRef.current();
        hasConnected = true;
      });
      socket.on("disconnect", () => {
        if (!disposed) setConnectionState("disconnected");
      });
      socket.on("connect_error", () => {
        if (!disposed) setConnectionState("reconnecting");
      });
      socket.io.on("reconnect_attempt", () => {
        if (!disposed) setConnectionState("reconnecting");
      });
      socket.on("location-update", (data: LocationUpdateData) => {
        if (!acceptCanonicalStateRef.current(data) || !mapRef.current) return;
        if (isZoomingRef.current) {
          pendingUpdatesRef.current[data.vehicleId] = data;
          return;
        }
        processLocationUpdateRef.current(data);
      });
      socket.connect();
    };

    void connectAfterSnapshot().catch(() => {
      if (!disposed) setConnectionState("disconnected");
    });
    return () => {
      disposed = true;
      socket?.disconnect();
    };
  }, [
    mapRef,
    isZoomingRef,
    pendingUpdatesRef,
    processLocationUpdateRef,
  ]);

  return connectionState;
}
