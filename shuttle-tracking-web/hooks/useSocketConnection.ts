"use client";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { backendConnection } from "@/config/backend";
import { startBrowserSocketLifecycle } from "@/services/browserSocketLifecycle";
import { LocationUpdateData, RealtimeConnectionState } from "@/types";

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isNullableFiniteNumber = (value: unknown): boolean =>
  value === null || (typeof value === "number" && Number.isFinite(value));

const isCanonicalLocation = (value: unknown): boolean => {
  if (value === null) return true;
  if (!isRecord(value)) return false;
  return typeof value.lat === "number"
    && Number.isFinite(value.lat)
    && typeof value.lng === "number"
    && Number.isFinite(value.lng)
    && isNullableFiniteNumber(value.speed)
    && isNullableFiniteNumber(value.heading)
    && isNullableFiniteNumber(value.accuracy)
    && (value.station === null || typeof value.station === "string");
};

const isLocationUpdateData = (value: unknown): value is LocationUpdateData => {
  if (!isRecord(value) || !isRecord(value.timing) || !isRecord(value.freshness)) return false;

  return value.schemaVersion === 1
    && value.eventType === "canonical_vehicle_state"
    && typeof value.stateEpoch === "string"
    && typeof value.stateVersion === "number"
    && Number.isFinite(value.stateVersion)
    && typeof value.vehicleId === "string"
    && (value.tripId === null || typeof value.tripId === "string")
    && (value.routeId === null || typeof value.routeId === "string")
    && typeof value.routeAuthority === "string"
    && ["active_trip", "vehicle_assignment", "unknown"].includes(value.routeAuthority)
    && typeof value.serviceState === "string"
    && ["live", "stale", "no_service", "unknown"].includes(value.serviceState)
    && typeof value.reasonCode === "string"
    && [
      "CANONICAL_SELECTED",
      "FALLBACK_SOURCE_SELECTED",
      "ALL_SOURCES_STALE",
      "SOURCE_NEVER_SEEN",
      "NO_ACTIVE_SOURCE",
      "DEPENDENCY_UNAVAILABLE",
      "RECOVERED",
    ].includes(value.reasonCode)
    && isCanonicalLocation(value.liveLocation)
    && isCanonicalLocation(value.lastKnownLocation)
    && (value.timing.observedAt === null || typeof value.timing.observedAt === "string")
    && typeof value.timing.receivedAt === "string"
    && typeof value.timing.selectedAt === "string"
    && value.timing.freshnessClock === "server_receive"
    && isNullableFiniteNumber(value.freshness.ageMs)
    && typeof value.freshness.thresholdMs === "number"
    && Number.isFinite(value.freshness.thresholdMs)
    && typeof value.freshness.bucket === "string"
    && ["fresh", "stale", "none"].includes(value.freshness.bucket)
    && (
      value.sourceType === null
      || (
        typeof value.sourceType === "string"
        && ["mobile", "esp32", "lorawan", "simulator"].includes(value.sourceType)
      )
    )
    && value.sourceId === undefined;
};

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
    let disposeSocket: (() => void) | null = null;

    const connectAfterSnapshot = async () => {
      try {
        await hydrateActiveVehiclesRef.current();
      } catch {
        // The socket can still recover if the initial REST snapshot is unavailable.
      }
      if (disposed) return;

      const lifecycle = startBrowserSocketLifecycle({
        origin: backendConnection.socketOrigin,
        onConnectionStateChange: setConnectionState,
        onReconnect: () => {
          void hydrateActiveVehiclesRef.current();
        },
        onLocationUpdate: (payload) => {
          if (!isLocationUpdateData(payload)) return;
          if (!acceptCanonicalStateRef.current(payload)) return;
          if (!mapRef.current) return;
          if (isZoomingRef.current) {
            pendingUpdatesRef.current[payload.vehicleId] = payload;
            return;
          }
          processLocationUpdateRef.current(payload);
        },
      });
      disposeSocket = lifecycle.dispose;
    };

    void connectAfterSnapshot().catch(() => {
      if (!disposed) setConnectionState("disconnected");
    });
    return () => {
      disposed = true;
      disposeSocket?.();
    };
  }, [
    mapRef,
    isZoomingRef,
    pendingUpdatesRef,
    processLocationUpdateRef,
  ]);

  return connectionState;
}
