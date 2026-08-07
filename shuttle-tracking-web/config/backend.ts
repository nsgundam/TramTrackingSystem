export interface BackendEnvironmentInput {
  environment?: string;
  backendOrigin?: string;
  legacyBackendUrl?: string;
  legacyApiBaseUrl?: string;
}

export interface BackendConnection {
  /** Empty means the browser's current origin. */
  origin: string;
  apiBaseUrl: string;
  /** Undefined tells Socket.IO to use the browser's current origin. */
  socketOrigin: string | undefined;
}

const CONFIGURATION_ERROR = "Invalid public backend connection configuration";

function optionalValue(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized ? normalized : undefined;
}

function isLocalHostname(hostname: string): boolean {
  const normalized = hostname.toLowerCase().replace(/^\[|\]$/g, "").replace(/\.$/, "");
  const mappedIpv4 = /^::(?:ffff:)?([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i.exec(normalized);
  if (mappedIpv4) {
    const high = Number.parseInt(mappedIpv4[1], 16);
    const low = Number.parseInt(mappedIpv4[2], 16);
    if ((high & 0xff00) === 0x7f00 || (high === 0 && low === 0)) return true;
  }
  return (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized === "0.0.0.0" ||
    normalized === "::" ||
    normalized === "::1" ||
    normalized === "host.docker.internal" ||
    /^127(?:\.\d{1,3}){3}$/.test(normalized) ||
    /^::ffff:127\./.test(normalized)
  );
}

function parseConnectionUrl(value: string, kind: "origin" | "api-base"): URL {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${CONFIGURATION_ERROR}: expected an absolute URL`);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`${CONFIGURATION_ERROR}: expected HTTP or HTTPS`);
  }
  if (parsed.username || parsed.password) {
    throw new Error(`${CONFIGURATION_ERROR}: credentials are not allowed`);
  }
  if (parsed.search || parsed.hash) {
    throw new Error(`${CONFIGURATION_ERROR}: query strings and fragments are not allowed`);
  }

  const normalizedPath = parsed.pathname.replace(/\/$/, "");
  const expectedPath = kind === "api-base" ? "/api" : "";
  if (normalizedPath !== expectedPath) {
    throw new Error(
      `${CONFIGURATION_ERROR}: ${kind === "api-base" ? "legacy API URL must end at /api" : "backend URL must be origin-only"}`,
    );
  }

  return parsed;
}

export function resolveBackendConnection(
  input: BackendEnvironmentInput,
): BackendConnection {
  const candidates: URL[] = [];
  const preferredOrigin = optionalValue(input.backendOrigin);
  const legacyBackendUrl = optionalValue(input.legacyBackendUrl);
  const legacyApiBaseUrl = optionalValue(input.legacyApiBaseUrl);

  if (preferredOrigin) candidates.push(parseConnectionUrl(preferredOrigin, "origin"));
  if (legacyBackendUrl) candidates.push(parseConnectionUrl(legacyBackendUrl, "origin"));
  if (legacyApiBaseUrl) candidates.push(parseConnectionUrl(legacyApiBaseUrl, "api-base"));

  const origins = new Set(candidates.map((candidate) => candidate.origin));
  if (origins.size > 1) {
    throw new Error(`${CONFIGURATION_ERROR}: environment values conflict`);
  }

  const explicitUrl = candidates[0];
  const isProduction = input.environment === "production";
  if (isProduction && explicitUrl) {
    if (explicitUrl.protocol !== "https:") {
      throw new Error(`${CONFIGURATION_ERROR}: production overrides must use HTTPS`);
    }
    if (isLocalHostname(explicitUrl.hostname)) {
      throw new Error(`${CONFIGURATION_ERROR}: production overrides cannot be local`);
    }
  }

  if (!explicitUrl && isProduction) {
    return {
      origin: "",
      apiBaseUrl: "/api",
      socketOrigin: undefined,
    };
  }

  const origin = explicitUrl?.origin ?? "http://localhost:3001";
  return {
    origin,
    apiBaseUrl: `${origin}/api`,
    socketOrigin: origin,
  };
}

export const backendConnection = resolveBackendConnection({
  environment: process.env.NODE_ENV,
  backendOrigin: process.env.NEXT_PUBLIC_BACKEND_ORIGIN,
  legacyBackendUrl: process.env.NEXT_PUBLIC_BACKEND_URL,
  legacyApiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
});
