import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  startBrowserSocketLifecycle,
  type BrowserSocketTransport,
  type BrowserSocketTransportFactory,
} from "../services/browserSocketLifecycle.ts";

const consumerSources = [
  "../hooks/useSocketConnection.ts",
  "../components/admin/LiveMap.tsx",
].map((relativePath) => ({
  relativePath,
  source: readFileSync(new URL(relativePath, import.meta.url), "utf8"),
}));
const sharedSource = readFileSync(
  new URL("../services/browserSocketLifecycle.ts", import.meta.url),
  "utf8",
);

type TransportListeners = Parameters<BrowserSocketTransport["subscribe"]>[0];

class FakeBrowserSocketTransport implements BrowserSocketTransport {
  readonly operations: string[] = [];
  readonly registeredEvents: string[] = [];
  readonly removedEvents: string[] = [];
  connectCount = 0;
  disconnectCount = 0;
  private listeners: TransportListeners | null = null;

  subscribe(listeners: TransportListeners): () => void {
    this.operations.push("subscribe");
    this.listeners = listeners;
    this.registeredEvents.push(
      "connect",
      "disconnect",
      "connect_error",
      "reconnect_attempt",
      "location-update",
    );
    return () => {
      this.operations.push("unsubscribe");
      this.removedEvents.push(
        "connect",
        "disconnect",
        "connect_error",
        "reconnect_attempt",
        "location-update",
      );
    };
  }

  connect(): void {
    this.operations.push("connect");
    this.connectCount += 1;
  }

  disconnect(): void {
    this.operations.push("disconnect");
    this.disconnectCount += 1;
  }

  emitConnect(): void {
    this.listeners?.onConnect();
  }

  emitDisconnect(): void {
    this.listeners?.onDisconnect();
  }

  emitConnectError(): void {
    this.listeners?.onConnectError();
  }

  emitReconnectAttempt(): void {
    this.listeners?.onReconnectAttempt();
  }

  emitLocationUpdate(payload: unknown): void {
    this.listeners?.onLocationUpdate(payload);
  }
}

test("T14 shared browser Socket.IO lifecycle has one transport owner", () => {
  const directOwners = consumerSources
    .filter(({ source }) => (
      /from ["']socket\.io-client["']/.test(source)
      || /\bio\s*\(/.test(source)
    ))
    .map(({ relativePath }) => relativePath);

  assert.deepEqual(
    directOwners,
    [],
    `expected consumers to delegate Socket.IO wiring; direct owners: ${directOwners.join(", ")}`,
  );

  consumerSources.forEach(({ source }) => {
    assert.match(source, /@\/services\/browserSocketLifecycle/);
    assert.match(source, /@\/config\/backend/);
    assert.doesNotMatch(
      source,
      /\.(?:on|off)\(\s*["'](?:connect|disconnect|connect_error|location-update)["']/,
    );
    assert.doesNotMatch(
      source,
      /\.io\.(?:on|off)\(\s*["']reconnect_attempt["']/,
    );
    assert.doesNotMatch(source, /\.(?:connect|disconnect)\(\)/);
  });
  assert.match(sharedSource, /from "socket\.io-client"/);
  assert.equal((sharedSource.match(/\bio\s*\(/g) ?? []).length, 1);
  [
    ["connect", "listeners.onConnect"],
    ["disconnect", "listeners.onDisconnect"],
    ["connect_error", "listeners.onConnectError"],
    ["location-update", "listeners.onLocationUpdate"],
  ].forEach(([eventName, listenerName]) => {
    assert.match(sharedSource, new RegExp(`socket\\.on\\("${eventName}", ${listenerName}\\)`));
    assert.match(sharedSource, new RegExp(`socket\\.off\\("${eventName}", ${listenerName}\\)`));
  });
  assert.match(
    sharedSource,
    /socket\.io\.on\("reconnect_attempt", listeners\.onReconnectAttempt\)/,
  );
  assert.match(
    sharedSource,
    /socket\.io\.off\("reconnect_attempt", listeners\.onReconnectAttempt\)/,
  );
  assert.doesNotMatch(
    sharedSource,
    /Canonical|hydrate|snapshot|mapRef|zoom|expiry|setTimeout|useState/,
  );
  assert.ok(
    sharedSource.indexOf("const unsubscribe = transport.subscribe")
      < sharedSource.indexOf("transport.connect();"),
    "listeners must be registered before explicit connect",
  );
});

test("T14 shared browser Socket.IO lifecycle preserves event order and owns cleanup", () => {
  const transport = new FakeBrowserSocketTransport();
  let capturedOrigin: string | undefined;
  let capturedAutoConnect: false | undefined;
  const createTransport: BrowserSocketTransportFactory = (origin, options) => {
    capturedOrigin = origin;
    capturedAutoConnect = options.autoConnect;
    return transport;
  };
  const callbackLog: string[] = [];
  const payloads: unknown[] = [];
  const lifecycle = startBrowserSocketLifecycle(
    {
      origin: "https://tram.example.edu",
      onConnectionStateChange: (state) => callbackLog.push(`state:${state}`),
      onReconnect: () => callbackLog.push("reconnect"),
      onLocationUpdate: (payload) => payloads.push(payload),
    },
    createTransport,
  );

  assert.equal(capturedOrigin, "https://tram.example.edu");
  assert.equal(capturedAutoConnect, false);
  assert.deepEqual(transport.operations, ["subscribe", "connect"]);
  assert.deepEqual(transport.registeredEvents, [
    "connect",
    "disconnect",
    "connect_error",
    "reconnect_attempt",
    "location-update",
  ]);

  transport.emitConnect();
  assert.deepEqual(callbackLog, ["state:connected"]);

  const opaquePayload = Symbol("opaque-location-update");
  transport.emitLocationUpdate(opaquePayload);
  assert.equal(payloads[0], opaquePayload);

  transport.emitDisconnect();
  transport.emitConnectError();
  transport.emitReconnectAttempt();
  assert.deepEqual(callbackLog, [
    "state:connected",
    "state:disconnected",
    "state:reconnecting",
    "state:reconnecting",
  ]);

  transport.emitConnect();
  assert.deepEqual(callbackLog.slice(-2), ["state:connected", "reconnect"]);

  lifecycle.dispose();
  lifecycle.dispose();
  assert.deepEqual(transport.removedEvents, transport.registeredEvents);
  assert.equal(transport.disconnectCount, 1);
  assert.deepEqual(transport.operations.slice(-2), ["unsubscribe", "disconnect"]);

  const callbackCountAfterDispose = callbackLog.length;
  const payloadCountAfterDispose = payloads.length;
  transport.emitConnect();
  transport.emitDisconnect();
  transport.emitConnectError();
  transport.emitReconnectAttempt();
  transport.emitLocationUpdate({ ignored: true });
  assert.equal(callbackLog.length, callbackCountAfterDispose);
  assert.equal(payloads.length, payloadCountAfterDispose);
});

test("T14 shared browser Socket.IO lifecycle preserves consumer asymmetries", () => {
  const publicSource = consumerSources[0].source;
  const adminSource = consumerSources[1].source;

  const publicSequence = [
    "await hydrateActiveVehiclesRef.current()",
    "const lifecycle = startBrowserSocketLifecycle",
    "if (!isLocationUpdateData(payload)) return",
    "if (!acceptCanonicalStateRef.current(payload)) return",
    "if (!mapRef.current) return",
    "if (isZoomingRef.current)",
    "pendingUpdatesRef.current[payload.vehicleId] = payload",
    "processLocationUpdateRef.current(payload)",
  ].map((token) => publicSource.indexOf(token));
  assert.ok(publicSequence.every((index) => index >= 0));
  assert.deepEqual([...publicSequence].sort((left, right) => left - right), publicSequence);
  assert.match(
    publicSource,
    /onReconnect:\s*\(\) => \{\s*void hydrateActiveVehiclesRef\.current\(\);/,
  );
  assert.match(
    publicSource,
    /try \{\s*await hydrateActiveVehiclesRef\.current\(\);\s*\} catch \{[\s\S]*?\}\s*if \(disposed\) return;/,
  );

  assert.ok(
    adminSource.indexOf("await hydrate(false)")
      < adminSource.indexOf("const lifecycle = startBrowserSocketLifecycle"),
  );
  assert.match(adminSource, /const isCanonicalVehicleState = \(value: unknown\)/);
  assert.match(adminSource, /onReconnect:\s*\(\) => \{\s*void hydrate\(true\);/);
  assert.match(adminSource, /onLocationUpdate: queueOrAcceptState/);
  assert.match(adminSource, /reconcileCanonicalVehicleSnapshot/);
  assert.match(adminSource, /statesReceivedDuringFailure\.forEach\(acceptState\)/);
  assert.match(adminSource, /\[snapshotAttempt\]/);
  assert.match(adminSource, /expiryTimersRef/);
  assert.match(adminSource, /Object\.values\(expiryTimersRef\.current\)\.forEach\(clearTimeout\)/);

  const adminHydrateSource = adminSource.slice(
    adminSource.indexOf("const hydrate = async"),
    adminSource.indexOf("const connectAfterSnapshot = async"),
  );
  const adminHydrateSequence = [
    "isHydrating = true",
    "queuedStates = []",
    "const vehicles = await getActiveVehicles()",
    "reconcileCanonicalVehicleSnapshot",
    "statesReceivedDuringFailure = queuedStates",
    "statesReceivedDuringFailure.forEach(acceptState)",
  ].map((token) => adminHydrateSource.indexOf(token));
  assert.ok(adminHydrateSequence.every((index) => index >= 0));
  assert.deepEqual(
    [...adminHydrateSequence].sort((left, right) => left - right),
    adminHydrateSequence,
  );
  assert.match(
    adminSource,
    /if \(isHydrating\) \{\s*queuedStates\.push\(candidate\);\s*return;\s*\}/,
  );
  assert.match(
    adminHydrateSource,
    /reconcileCanonicalVehicleSnapshot\(\s*snapshotStates,\s*queuedStates,\s*\)/,
  );
});

test("T14 Socket.IO consumers reject coerced enums and Public source identity", () => {
  const publicSource = consumerSources[0].source;
  const adminSource = consumerSources[1].source;

  [publicSource, adminSource].forEach((source) => {
    assert.doesNotMatch(
      source,
      /String\(value\.(?:routeAuthority|serviceState|reasonCode|sourceType|freshness\.bucket)\)/,
    );
    assert.match(source, /typeof value\.routeAuthority === "string"/);
    assert.match(source, /typeof value\.serviceState === "string"/);
    assert.match(source, /typeof value\.reasonCode === "string"/);
    assert.match(source, /typeof value\.freshness\.bucket === "string"/);
    assert.match(source, /typeof value\.sourceType === "string"/);
  });

  assert.match(publicSource, /value\.sourceId === undefined/);
});
