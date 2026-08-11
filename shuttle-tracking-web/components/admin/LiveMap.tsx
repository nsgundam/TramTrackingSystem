"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { RefreshCw } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { backendConnection } from "@/config/backend";
import { startBrowserSocketLifecycle } from "@/services/browserSocketLifecycle";
import { getActiveVehicles } from "@/services/publicApi";
import {
  CanonicalVehicleStateV1,
  RealtimeConnectionState,
  isCanonicalStateNewer,
} from "@/types";
import { projectCanonicalVehicleStateCounts } from "@/utils/canonical-public-state";
import {
  getCanonicalDisplayState,
  getCanonicalExpiryDelayMs,
  reconcileCanonicalVehicleSnapshot,
} from "@/utils/truthful-ui-state";

const busIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
});

type SnapshotState = "loading" | "ready" | "error";

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

const isCanonicalVehicleState = (value: unknown): value is CanonicalVehicleStateV1 => {
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
    && (
      value.sourceId === undefined
      || value.sourceId === null
      || typeof value.sourceId === "string"
    );
};

export default function LiveMap() {
  const [activeVehicles, setActiveVehicles] = useState<Record<string, CanonicalVehicleStateV1>>({});
  const [expiredVehicles, setExpiredVehicles] = useState<Record<string, boolean>>({});
  const [connectionState, setConnectionState] = useState<RealtimeConnectionState>("reconnecting");
  const [snapshotState, setSnapshotState] = useState<SnapshotState>("loading");
  const [hasAuthoritativeState, setHasAuthoritativeState] = useState(false);
  const [snapshotAttempt, setSnapshotAttempt] = useState(0);
  const activeVehiclesRef = useRef<Record<string, CanonicalVehicleStateV1>>({});
  const expiredVehiclesRef = useRef<Record<string, boolean>>({});
  const versionsRef = useRef<Record<string, Pick<CanonicalVehicleStateV1, "stateEpoch" | "stateVersion">>>({});
  const expiryTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  useEffect(() => {
    let disposed = false;
    let disposeSocket: (() => void) | null = null;
    let isHydrating = false;
    let queuedStates: CanonicalVehicleStateV1[] = [];

    const clearExpiryTimer = (vehicleId: string) => {
      const timer = expiryTimersRef.current[vehicleId];
      if (timer) clearTimeout(timer);
      delete expiryTimersRef.current[vehicleId];
    };

    const scheduleLocalExpiry = (state: CanonicalVehicleStateV1) => {
      clearExpiryTimer(state.vehicleId);
      expiredVehiclesRef.current[state.vehicleId] = false;
      const delayMs = getCanonicalExpiryDelayMs(state);
      if (delayMs === null) return;

      expiryTimersRef.current[state.vehicleId] = setTimeout(() => {
        if (disposed) return;
        const current = activeVehiclesRef.current[state.vehicleId];
        if (
          current
          && current.serviceState === "live"
          && current.stateEpoch === state.stateEpoch
          && current.stateVersion === state.stateVersion
        ) {
          expiredVehiclesRef.current = {
            ...expiredVehiclesRef.current,
            [state.vehicleId]: true,
          };
          setExpiredVehicles((existing) => ({ ...existing, [state.vehicleId]: true }));
        }
      }, delayMs);
    };

    const commitSnapshot = (nextStates: Record<string, CanonicalVehicleStateV1>) => {
      Object.values(expiryTimersRef.current).forEach(clearTimeout);
      expiryTimersRef.current = {};
      activeVehiclesRef.current = nextStates;
      versionsRef.current = Object.values(nextStates).reduce<
        Record<string, Pick<CanonicalVehicleStateV1, "stateEpoch" | "stateVersion">>
      >((versions, state) => {
        versions[state.vehicleId] = {
          stateEpoch: state.stateEpoch,
          stateVersion: state.stateVersion,
        };
        return versions;
      }, {});
      expiredVehiclesRef.current = {};
      setExpiredVehicles({});
      setActiveVehicles(nextStates);
      Object.values(nextStates).forEach(scheduleLocalExpiry);
    };

    const acceptState = (candidate: unknown): boolean => {
      if (!isCanonicalVehicleState(candidate)) return false;
      const previous = versionsRef.current[candidate.vehicleId];
      if (!isCanonicalStateNewer(candidate, previous)) return false;

      versionsRef.current[candidate.vehicleId] = {
        stateEpoch: candidate.stateEpoch,
        stateVersion: candidate.stateVersion,
      };
      const nextStates = {
        ...activeVehiclesRef.current,
        [candidate.vehicleId]: candidate,
      };
      activeVehiclesRef.current = nextStates;
      expiredVehiclesRef.current = {
        ...expiredVehiclesRef.current,
        [candidate.vehicleId]: false,
      };
      setExpiredVehicles((existing) => ({ ...existing, [candidate.vehicleId]: false }));
      setActiveVehicles(nextStates);
      setHasAuthoritativeState(true);
      scheduleLocalExpiry(candidate);
      return true;
    };

    const queueOrAcceptState = (candidate: unknown) => {
      if (!isCanonicalVehicleState(candidate)) return;
      if (isHydrating) {
        queuedStates.push(candidate);
        return;
      }
      acceptState(candidate);
    };

    const hydrate = async (announceLoading: boolean) => {
      if (isHydrating) return;
      if (announceLoading) setSnapshotState("loading");
      isHydrating = true;
      queuedStates = [];

      try {
        const vehicles = await getActiveVehicles();
        if (disposed) return;
        const snapshotStates = vehicles
          .map((vehicle) => vehicle.state)
          .filter(isCanonicalVehicleState);
        if (snapshotStates.length !== vehicles.length) {
          throw new Error("INVALID_CANONICAL_SNAPSHOT");
        }
        const reconciled = reconcileCanonicalVehicleSnapshot(
          snapshotStates,
          queuedStates,
        );
        queuedStates = [];
        isHydrating = false;
        commitSnapshot(reconciled);
        setHasAuthoritativeState(true);
        setSnapshotState("ready");
      } catch {
        if (disposed) return;
        const statesReceivedDuringFailure = queuedStates;
        queuedStates = [];
        isHydrating = false;
        statesReceivedDuringFailure.forEach(acceptState);
        setSnapshotState("error");
      } finally {
        if (disposed) {
          isHydrating = false;
          queuedStates = [];
        }
      }
    };

    const connectAfterSnapshot = async () => {
      await hydrate(false);
      if (disposed) return;

      const lifecycle = startBrowserSocketLifecycle({
        origin: backendConnection.socketOrigin,
        onConnectionStateChange: setConnectionState,
        onReconnect: () => {
          void hydrate(true);
        },
        onLocationUpdate: queueOrAcceptState,
      });
      disposeSocket = lifecycle.dispose;
    };

    void connectAfterSnapshot().catch(() => {
      if (!disposed) setConnectionState("disconnected");
    });
    return () => {
      disposed = true;
      isHydrating = false;
      queuedStates = [];
      Object.values(expiryTimersRef.current).forEach(clearTimeout);
      expiryTimersRef.current = {};
      disposeSocket?.();
    };
  }, [snapshotAttempt]);

  const displayExpiredVehicles = { ...expiredVehicles };
  if (connectionState !== "connected") {
    Object.values(activeVehicles).forEach((state) => {
      if (state.serviceState === "live") displayExpiredVehicles[state.vehicleId] = true;
    });
  }
  const stateCounts = projectCanonicalVehicleStateCounts(
    activeVehicles,
    displayExpiredVehicles,
  );

  const retrySnapshot = () => {
    setSnapshotState("loading");
    setConnectionState("reconnecting");
    setSnapshotAttempt((attempt) => attempt + 1);
  };

  return (
    <div
      className="admin-live-map"
      data-testid="admin-live-map"
      role="region"
      aria-label="Canonical vehicle service map"
    >
      <div
        className="admin-map-status-surface"
        data-testid="admin-map-status-surface"
      >
        <div
          className="admin-system-status"
          data-testid="admin-realtime-status"
          role="status"
          aria-live="polite"
        >
          <div className="admin-system-status__row">
            <span className="admin-system-status__label">Realtime:{" "}</span>
            <strong className="admin-system-status__value">
              {connectionState === "connected"
                ? "Connected"
                : connectionState === "reconnecting"
                  ? "Reconnecting"
                  : "Disconnected"}
            </strong>
          </div>
          <div className="admin-system-status__row">
            <span className="admin-system-status__label">Snapshot:{" "}</span>
            <strong className="admin-system-status__value">
              {snapshotState === "ready"
                ? "Ready"
                : snapshotState === "loading"
                  ? "Loading"
                  : "Unavailable"}
            </strong>
          </div>
          {snapshotState === "error" && (
            <button
              type="button"
              onClick={retrySnapshot}
              className="admin-snapshot-retry"
              data-testid="admin-snapshot-retry"
            >
              <RefreshCw size={13} aria-hidden="true" />
              Retry snapshot
            </button>
          )}
        </div>

        <div
          aria-label="Vehicle service state summary"
          className="admin-state-summary"
          data-testid="admin-state-summary"
        >
          {hasAuthoritativeState ? (
            <>
              <div className="admin-state-summary__item">Live: {stateCounts.live}</div>
              <div className="admin-state-summary__item">Last known: {stateCounts.stale}</div>
              <div className="admin-state-summary__item">No service: {stateCounts.no_service}</div>
              <div className="admin-state-summary__item">Unavailable: {stateCounts.unknown}</div>
            </>
          ) : (
            <div className="admin-state-summary__waiting">Waiting for canonical vehicle state</div>
          )}
        </div>
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
          const displayState = getCanonicalDisplayState(
            state,
            Boolean(displayExpiredVehicles[state.vehicleId]),
          );
          if (!displayState.location) return null;
          return (
            <Marker
              key={`${state.vehicleId}:${state.stateEpoch}:${state.stateVersion}`}
              position={[displayState.location.lat, displayState.location.lng]}
              icon={busIcon}
              opacity={displayState.serviceState === "stale" ? 0.55 : 1}
            >
              <Popup>
                <div className="text-center">
                  <strong className="text-lg text-blue-600 block mb-1">{state.vehicleId}</strong>
                  <p className="text-sm m-0">State: {displayState.serviceState}</p>
                  <p className="text-sm m-0">Route: {state.routeId || "Unknown"}</p>
                  <p className="text-sm m-0">Speed: {displayState.location.speed ?? 0} km/h</p>
                  <p className="text-xs text-slate-500 m-0 mt-1">
                    {displayState.serviceState === "stale"
                      ? "Last known location — ETA unavailable"
                      : displayState.location.station || "No station"}
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
