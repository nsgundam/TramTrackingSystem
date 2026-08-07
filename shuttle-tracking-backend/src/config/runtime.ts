import { isIP } from 'node:net';

const DEVELOPMENT_DATABASE_URL =
  'postgresql://postgres:password@localhost:5432/shuttle_tracking?schema=public';
const DEVELOPMENT_REDIS_URL = 'redis://localhost:6379';
const DEVELOPMENT_FRONTEND_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];
const MINIMUM_DATABASE_PASSWORD_LENGTH = 16;
const MINIMUM_REDIS_PASSWORD_LENGTH = 16;
const MINIMUM_APPLICATION_SECRET_LENGTH = 32;

type Environment = Readonly<Record<string, string | undefined>>;

export interface RuntimeConfig {
  environment: string;
  production: boolean;
  databaseUrl: string;
  redis: {
    url: string;
    password?: string;
  };
  frontendOrigins: string[];
  trustProxy: false | string[];
  port: number;
}

export const CORS_METHODS = [
  'GET',
  'HEAD',
  'POST',
  'PUT',
  'PATCH',
  'DELETE',
  'OPTIONS',
] as const;

export const isAllowedRequestOrigin = (
  origin: string | undefined,
  frontendOrigins: readonly string[],
): boolean => origin === undefined || frontendOrigins.includes(origin);

type ConfigurationField =
  | 'NODE_ENV'
  | 'DATABASE_URL'
  | 'REDIS_URL'
  | 'REDIS_PASSWORD'
  | 'JWT_SECRET'
  | 'TTN_WEBHOOK_SECRET'
  | 'FRONTEND_URL'
  | 'TRUST_PROXY'
  | 'PORT';

type ConfigurationReason =
  | 'missing'
  | 'placeholder'
  | 'malformed'
  | 'authentication_required'
  | 'weak_secret'
  | 'local_endpoint'
  | 'insecure_origin'
  | 'origin_required'
  | 'conflict'
  | 'unsafe_proxy';

export class RuntimeConfigurationError extends Error {
  constructor(
    public readonly field: ConfigurationField,
    public readonly reason: ConfigurationReason,
  ) {
    super(`Invalid runtime configuration: ${field} (${reason})`);
    this.name = 'RuntimeConfigurationError';
  }
}

const fail = (field: ConfigurationField, reason: ConfigurationReason): never => {
  throw new RuntimeConfigurationError(field, reason);
};

const value = (env: Environment, field: ConfigurationField): string | undefined => {
  const candidate = env[field]?.trim();
  return candidate ? candidate : undefined;
};

const isPlaceholder = (candidate: string): boolean => {
  const normalized = candidate.trim();
  return normalized.length === 0
    || /change[_-]?me/i.test(normalized)
    || /replace[_-]?with/i.test(normalized)
    || /placeholder/i.test(normalized)
    || /your[_-]/i.test(normalized)
    || /trackingjwt|lorawan/i.test(normalized)
    || /^<[^>]+>$/.test(normalized)
    || /^\{[^}]+\}$/.test(normalized);
};

const requiredProductionValue = (
  env: Environment,
  field: ConfigurationField,
): string => {
  const candidate = value(env, field);
  if (!candidate) return fail(field, 'missing');
  if (isPlaceholder(candidate)) fail(field, 'placeholder');
  return candidate;
};

const decodedCredential = (candidate: string, field: ConfigurationField): string => {
  try {
    return decodeURIComponent(candidate);
  } catch {
    return fail(field, 'malformed');
  }
};

const hostnameWithoutBrackets = (hostname: string): string =>
  hostname.startsWith('[') && hostname.endsWith(']')
    ? hostname.slice(1, -1)
    : hostname;

const isLoopbackOrWildcardHost = (hostname: string): boolean => {
  const normalized = hostnameWithoutBrackets(hostname).toLowerCase().replace(/\.$/, '');
  if (
    normalized === 'localhost'
    || normalized.endsWith('.localhost')
    || normalized === '0.0.0.0'
    || normalized === '::'
    || normalized === '::1'
  ) {
    return true;
  }

  if (isIP(normalized) === 4) {
    const firstOctet = Number(normalized.split('.')[0]);
    return firstOctet === 127;
  }

  const mappedIpv4 = /^::(?:ffff:)?([0-9a-f]{1,4}):([0-9a-f]{1,4})$/i.exec(normalized);
  if (mappedIpv4) {
    const high = Number.parseInt(mappedIpv4[1]!, 16);
    const low = Number.parseInt(mappedIpv4[2]!, 16);
    return (high & 0xff00) === 0x7f00 || (high === 0 && low === 0);
  }

  return false;
};

const parseUrl = (candidate: string, field: ConfigurationField): URL => {
  try {
    return new URL(candidate);
  } catch {
    return fail(field, 'malformed');
  }
};

const parseDatabaseUrl = (candidate: string, production: boolean): string => {
  const parsed = parseUrl(candidate, 'DATABASE_URL');
  if (
    (parsed.protocol !== 'postgres:' && parsed.protocol !== 'postgresql:')
    || !parsed.hostname
    || !parsed.pathname
    || parsed.pathname === '/'
    || parsed.pathname.slice(1).includes('/')
  ) {
    return fail('DATABASE_URL', 'malformed');
  }

  if (production) {
    if (!parsed.username || !parsed.password) {
      return fail('DATABASE_URL', 'authentication_required');
    }

    const password = decodedCredential(parsed.password, 'DATABASE_URL');
    if (isPlaceholder(parsed.username) || isPlaceholder(password)) {
      return fail('DATABASE_URL', 'placeholder');
    }
    if (password.length < MINIMUM_DATABASE_PASSWORD_LENGTH) {
      return fail('DATABASE_URL', 'weak_secret');
    }
    if (isLoopbackOrWildcardHost(parsed.hostname)) {
      return fail('DATABASE_URL', 'local_endpoint');
    }
  }

  return candidate;
};

const parseRedis = (
  redisUrl: string,
  separatePassword: string | undefined,
  production: boolean,
): RuntimeConfig['redis'] => {
  const parsed = parseUrl(redisUrl, 'REDIS_URL');
  if ((parsed.protocol !== 'redis:' && parsed.protocol !== 'rediss:') || !parsed.hostname) {
    return fail('REDIS_URL', 'malformed');
  }

  const embeddedPassword = parsed.password
    ? decodedCredential(parsed.password, 'REDIS_URL')
    : undefined;

  if (
    embeddedPassword
    && separatePassword
    && embeddedPassword !== separatePassword
  ) {
    return fail('REDIS_PASSWORD', 'conflict');
  }

  const password = separatePassword ?? embeddedPassword;
  if (production) {
    if (isLoopbackOrWildcardHost(parsed.hostname)) {
      return fail('REDIS_URL', 'local_endpoint');
    }
    if (!password) {
      return fail('REDIS_PASSWORD', 'authentication_required');
    }
    if (isPlaceholder(password)) {
      return fail('REDIS_PASSWORD', 'placeholder');
    }
    if (password.length < MINIMUM_REDIS_PASSWORD_LENGTH) {
      return fail('REDIS_PASSWORD', 'weak_secret');
    }
    if (separatePassword && !/^[A-Za-z0-9_-]+$/.test(separatePassword)) {
      return fail('REDIS_PASSWORD', 'malformed');
    }
  }

  return password ? { url: redisUrl, password } : { url: redisUrl };
};

const parseApplicationSecrets = (env: Environment): void => {
  const jwtSecret = requiredProductionValue(env, 'JWT_SECRET');
  const ttnWebhookSecret = requiredProductionValue(env, 'TTN_WEBHOOK_SECRET');

  if (jwtSecret.length < MINIMUM_APPLICATION_SECRET_LENGTH) {
    fail('JWT_SECRET', 'weak_secret');
  }
  if (ttnWebhookSecret.length < MINIMUM_APPLICATION_SECRET_LENGTH) {
    fail('TTN_WEBHOOK_SECRET', 'weak_secret');
  }
  if (jwtSecret === ttnWebhookSecret) {
    fail('TTN_WEBHOOK_SECRET', 'conflict');
  }
};

const parseFrontendOrigin = (candidate: string, production: boolean): string => {
  const parsed = parseUrl(candidate, 'FRONTEND_URL');
  if (
    !parsed.hostname
    || parsed.username
    || parsed.password
    || parsed.pathname !== '/'
    || parsed.search
    || parsed.hash
  ) {
    return fail('FRONTEND_URL', 'origin_required');
  }

  if (production) {
    if (parsed.protocol !== 'https:') {
      return fail('FRONTEND_URL', 'insecure_origin');
    }
    if (isLoopbackOrWildcardHost(parsed.hostname)) {
      return fail('FRONTEND_URL', 'local_endpoint');
    }
    if (isPlaceholder(parsed.hostname)) {
      return fail('FRONTEND_URL', 'placeholder');
    }
  } else if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    return fail('FRONTEND_URL', 'insecure_origin');
  }

  return parsed.origin;
};

const parseProxyEntry = (entry: string): string => {
  const slashIndex = entry.lastIndexOf('/');
  const address = slashIndex === -1 ? entry : entry.slice(0, slashIndex);
  const prefixText = slashIndex === -1 ? undefined : entry.slice(slashIndex + 1);
  const normalizedAddress = hostnameWithoutBrackets(address);
  const family = isIP(normalizedAddress);

  if (family === 0 || !address || (slashIndex !== -1 && !prefixText)) {
    return fail('TRUST_PROXY', 'unsafe_proxy');
  }
  if (normalizedAddress === '0.0.0.0' || normalizedAddress === '::') {
    return fail('TRUST_PROXY', 'unsafe_proxy');
  }

  if (prefixText !== undefined) {
    if (!/^\d+$/.test(prefixText)) {
      return fail('TRUST_PROXY', 'unsafe_proxy');
    }

    const prefix = Number(prefixText);
    const minimumPrefix = family === 4 ? 24 : 64;
    const maximumPrefix = family === 4 ? 32 : 128;
    if (prefix < minimumPrefix || prefix > maximumPrefix) {
      return fail('TRUST_PROXY', 'unsafe_proxy');
    }
  }

  return prefixText === undefined
    ? normalizedAddress
    : `${normalizedAddress}/${prefixText}`;
};

const parseTrustProxy = (
  candidate: string | undefined,
  production: boolean,
): false | string[] => {
  if (!candidate) {
    if (production) fail('TRUST_PROXY', 'missing');
    return false;
  }
  if (isPlaceholder(candidate)) fail('TRUST_PROXY', 'placeholder');

  const rawEntries = candidate.split(',').map((entry) => entry.trim());
  if (rawEntries.some((entry) => entry.length === 0)) {
    return fail('TRUST_PROXY', 'unsafe_proxy');
  }

  return [...new Set(rawEntries.map(parseProxyEntry))];
};

const parsePort = (candidate: string | undefined): number => {
  if (!candidate) return 3001;
  if (!/^\d+$/.test(candidate)) return fail('PORT', 'malformed');

  const port = Number(candidate);
  if (!Number.isSafeInteger(port) || port < 1 || port > 65535) {
    return fail('PORT', 'malformed');
  }
  return port;
};

export const parseRuntimeConfig = (env: Environment): RuntimeConfig => {
  const rawEnvironment = env.NODE_ENV;
  const environment = rawEnvironment ?? 'development';
  if (
    environment !== environment.trim()
    || !['development', 'test', 'production'].includes(environment)
  ) {
    fail('NODE_ENV', 'malformed');
  }
  const production = environment === 'production';

  const databaseUrl = production
    ? requiredProductionValue(env, 'DATABASE_URL')
    : value(env, 'DATABASE_URL') ?? DEVELOPMENT_DATABASE_URL;
  const redisUrl = production
    ? requiredProductionValue(env, 'REDIS_URL')
    : value(env, 'REDIS_URL') ?? DEVELOPMENT_REDIS_URL;
  const separateRedisPassword = value(env, 'REDIS_PASSWORD');

  if (production) {
    parseApplicationSecrets(env);
  }

  const configuredFrontendOrigin = production
    ? requiredProductionValue(env, 'FRONTEND_URL')
    : value(env, 'FRONTEND_URL');
  const frontendOrigins = configuredFrontendOrigin
    ? [
        parseFrontendOrigin(configuredFrontendOrigin, production),
        ...(production ? [] : DEVELOPMENT_FRONTEND_ORIGINS),
      ]
    : [...DEVELOPMENT_FRONTEND_ORIGINS];

  return {
    environment,
    production,
    databaseUrl: parseDatabaseUrl(databaseUrl, production),
    redis: parseRedis(redisUrl, separateRedisPassword, production),
    frontendOrigins: [...new Set(frontendOrigins)],
    trustProxy: parseTrustProxy(value(env, 'TRUST_PROXY'), production),
    port: parsePort(value(env, 'PORT')),
  };
};
