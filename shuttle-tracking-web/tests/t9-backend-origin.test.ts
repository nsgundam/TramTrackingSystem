import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { resolveBackendConnection } from "../config/backend.ts";

test("T9 production defaults REST and Socket.IO to the browser origin", () => {
  assert.deepEqual(
    resolveBackendConnection({ environment: "production" }),
    {
      origin: "",
      apiBaseUrl: "/api",
      socketOrigin: undefined,
    },
  );

  assert.deepEqual(
    resolveBackendConnection({
      environment: "production",
      backendOrigin: "  ",
      legacyBackendUrl: "",
      legacyApiBaseUrl: "\t",
    }),
    {
      origin: "",
      apiBaseUrl: "/api",
      socketOrigin: undefined,
    },
  );
});

test("T9 shares one explicit HTTPS production origin across REST and Socket.IO", () => {
  assert.deepEqual(
    resolveBackendConnection({
      environment: "production",
      backendOrigin: "https://demo.example.edu/",
      legacyBackendUrl: "https://demo.example.edu",
      legacyApiBaseUrl: "https://demo.example.edu/api/",
    }),
    {
      origin: "https://demo.example.edu",
      apiBaseUrl: "https://demo.example.edu/api",
      socketOrigin: "https://demo.example.edu",
    },
  );
});

test("T9 preserves the development default and matching Playwright legacy variables", () => {
  assert.deepEqual(
    resolveBackendConnection({ environment: "development" }),
    {
      origin: "http://localhost:3001",
      apiBaseUrl: "http://localhost:3001/api",
      socketOrigin: "http://localhost:3001",
    },
  );

  assert.deepEqual(
    resolveBackendConnection({
      environment: "development",
      legacyBackendUrl: "http://127.0.0.1:13001",
      legacyApiBaseUrl: "http://127.0.0.1:13001/api",
    }),
    {
      origin: "http://127.0.0.1:13001",
      apiBaseUrl: "http://127.0.0.1:13001/api",
      socketOrigin: "http://127.0.0.1:13001",
    },
  );
});

test("T9 rejects conflicting or unsafe production origins", () => {
  const invalidInputs = [
    {
      environment: "production",
      backendOrigin: "https://one.example.edu",
      legacyApiBaseUrl: "https://two.example.edu/api",
    },
    { environment: "production", backendOrigin: "http://demo.example.edu" },
    { environment: "production", backendOrigin: "https://localhost" },
    { environment: "production", backendOrigin: "https://localhost." },
    { environment: "production", backendOrigin: "https://127.0.0.1" },
    { environment: "production", backendOrigin: "https://[::ffff:127.0.0.1]" },
    { environment: "production", backendOrigin: "https://demo.example.edu/backend" },
    { environment: "production", legacyApiBaseUrl: "https://demo.example.edu/v1" },
    { environment: "production", backendOrigin: "https://user:pass@demo.example.edu" },
    { environment: "production", backendOrigin: "https://demo.example.edu?debug=1" },
    { environment: "production", backendOrigin: "ftp://demo.example.edu" },
  ];

  invalidInputs.forEach((input) => {
    assert.throws(
      () => resolveBackendConnection(input),
      /^Error: Invalid public backend connection configuration:/,
    );
  });
});

test("T9 listed consumers use only the central connection authority", () => {
  const consumerPaths = [
    "../services/api.ts",
    "../services/publicApi.ts",
    "../hooks/useShuttleTracker.ts",
    "../hooks/useSocketConnection.ts",
    "../components/public/FeedbackModal.tsx",
    "../components/admin/LiveMap.tsx",
  ];

  consumerPaths.forEach((relativePath) => {
    const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");
    assert.match(source, /@\/config\/backend/);
    assert.doesNotMatch(source, /process\.env\.NEXT_PUBLIC_/);
    assert.doesNotMatch(source, /localhost(?::\d+)?/);
  });

  const trackerSource = readFileSync(
    new URL("../hooks/useShuttleTracker.ts", import.meta.url),
    "utf8",
  );
  assert.match(trackerSource, /const BACKEND_ORIGINS = \[backendConnection\.origin\]/);
  assert.doesNotMatch(trackerSource, /getApiOrigins|for \(const origin of/);

  const nextConfigSource = readFileSync(
    new URL("../next.config.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(nextConfigSource, /localhost|destination\s*:|rewrites\s*\(/);
});
