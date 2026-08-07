import assert from 'node:assert/strict';
import { chmod, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import express from 'express';

import {
  CORS_METHODS,
  isAllowedRequestOrigin,
  parseRuntimeConfig,
  RuntimeConfigurationError,
} from '../dist/config/runtime.js';

const VALID_PRODUCTION_ENV = {
  NODE_ENV: 'production',
  DATABASE_URL:
    'postgresql://shuttle_user:database-passphrase-123456@db:5432/shuttle_tracking',
  REDIS_URL: 'redis://redis:6379',
  REDIS_PASSWORD: 'redis-passphrase-123456789',
  JWT_SECRET: 'jwt-secret-1234567890-abcdefghijklmnopqrstuvwxyz',
  TTN_WEBHOOK_SECRET: 'ttn-secret-0987654321-abcdefghijklmnopqrstuvwxyz',
  FRONTEND_URL: 'https://tram-tracking.rsu.ac.th',
  TRUST_PROXY: '10.20.30.40/32,2001:db8::40/128',
  PORT: '3001',
};

const valid = parseRuntimeConfig(VALID_PRODUCTION_ENV);
assert.equal(valid.production, true);
assert.equal(valid.databaseUrl, VALID_PRODUCTION_ENV.DATABASE_URL);
assert.deepEqual(valid.redis, {
  url: VALID_PRODUCTION_ENV.REDIS_URL,
  password: VALID_PRODUCTION_ENV.REDIS_PASSWORD,
});
assert.deepEqual(valid.frontendOrigins, ['https://tram-tracking.rsu.ac.th']);
assert.deepEqual(valid.trustProxy, ['10.20.30.40/32', '2001:db8::40/128']);
assert.equal(valid.port, 3001);
assert.deepEqual(CORS_METHODS, ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);
assert.equal(isAllowedRequestOrigin(undefined, valid.frontendOrigins), true);
assert.equal(isAllowedRequestOrigin('https://tram-tracking.rsu.ac.th', valid.frontendOrigins), true);
assert.equal(isAllowedRequestOrigin('', valid.frontendOrigins), false);
assert.equal(isAllowedRequestOrigin('https://tram-tracking.rsu.ac.th/', valid.frontendOrigins), false);
assert.equal(isAllowedRequestOrigin('https://evil.example.test', valid.frontendOrigins), false);

const development = parseRuntimeConfig({ NODE_ENV: 'development' });
assert.equal(development.production, false);
assert.match(development.databaseUrl, /localhost:5432/);
assert.deepEqual(development.redis, { url: 'redis://localhost:6379' });
assert.deepEqual(development.frontendOrigins, [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);
assert.equal(development.trustProxy, false);
assert.equal(development.port, 3001);

const embeddedRedisPassword = 'embedded-redis-passphrase-123';
const embeddedRedis = parseRuntimeConfig({
  ...VALID_PRODUCTION_ENV,
  REDIS_URL: `redis://:${embeddedRedisPassword}@redis:6379`,
  REDIS_PASSWORD: undefined,
});
assert.equal(embeddedRedis.redis.password, embeddedRedisPassword);

const encodedRedisPassword = 'encoded_redis-passphrase-123';
const matchingRedisPasswords = parseRuntimeConfig({
  ...VALID_PRODUCTION_ENV,
  REDIS_URL: 'redis://:encoded%5Fredis-passphrase-123@redis:6379',
  REDIS_PASSWORD: encodedRedisPassword,
});
assert.equal(matchingRedisPasswords.redis.password, encodedRedisPassword);

const expectInvalid = (overrides, field, reason) => {
  assert.throws(
    () => parseRuntimeConfig({ ...VALID_PRODUCTION_ENV, ...overrides }),
    (error) => {
      assert.equal(error instanceof RuntimeConfigurationError, true);
      assert.equal(error.field, field);
      assert.equal(error.reason, reason);
      assert.equal(error.message.includes('database-passphrase-123456'), false);
      assert.equal(error.message.includes('redis-passphrase-123456789'), false);
      assert.equal(error.message.includes('abcdefghijklmnopqrstuvwxyz'), false);
      return true;
    },
  );
};

expectInvalid({ DATABASE_URL: undefined }, 'DATABASE_URL', 'missing');
expectInvalid({ DATABASE_URL: 'not-a-url' }, 'DATABASE_URL', 'malformed');
expectInvalid(
  { DATABASE_URL: 'postgresql://shuttle_user@db:5432/shuttle_tracking' },
  'DATABASE_URL',
  'authentication_required',
);
expectInvalid(
  { DATABASE_URL: 'postgresql://shuttle_user:database-passphrase-123456@db:5432' },
  'DATABASE_URL',
  'malformed',
);
expectInvalid(
  { DATABASE_URL: 'postgresql://shuttle_user:short@db:5432/shuttle_tracking' },
  'DATABASE_URL',
  'weak_secret',
);
expectInvalid(
  {
    DATABASE_URL:
      'postgresql://shuttle_user:database-passphrase-123456@localhost:5432/shuttle_tracking',
  },
  'DATABASE_URL',
  'local_endpoint',
);
expectInvalid(
  {
    DATABASE_URL:
      'postgresql://shuttle_user:database-passphrase-123456@[::ffff:127.0.0.1]:5432/shuttle_tracking',
  },
  'DATABASE_URL',
  'local_endpoint',
);
expectInvalid(
  {
    DATABASE_URL:
      'postgresql://shuttle_user:REPLACE_WITH_DATABASE_PASSWORD@db:5432/shuttle_tracking',
  },
  'DATABASE_URL',
  'placeholder',
);
expectInvalid(
  {
    DATABASE_URL:
      'postgresql://shuttle_user:your_secure_password_here@db:5432/shuttle_tracking',
  },
  'DATABASE_URL',
  'placeholder',
);

expectInvalid({ REDIS_URL: undefined }, 'REDIS_URL', 'missing');
expectInvalid({ REDIS_URL: 'http://redis:6379' }, 'REDIS_URL', 'malformed');
expectInvalid({ REDIS_URL: 'redis://localhost:6379' }, 'REDIS_URL', 'local_endpoint');
expectInvalid(
  { REDIS_URL: 'redis://[::ffff:127.0.0.1]:6379' },
  'REDIS_URL',
  'local_endpoint',
);
expectInvalid({ REDIS_PASSWORD: undefined }, 'REDIS_PASSWORD', 'authentication_required');
expectInvalid({ REDIS_PASSWORD: 'short' }, 'REDIS_PASSWORD', 'weak_secret');
expectInvalid({ REDIS_PASSWORD: 'REPLACE_WITH_REDIS_PASSWORD' }, 'REDIS_PASSWORD', 'placeholder');
expectInvalid({ REDIS_PASSWORD: 'your_secure_password_here' }, 'REDIS_PASSWORD', 'placeholder');
expectInvalid(
  { REDIS_PASSWORD: 'long-enough-password\nprotected-mode no' },
  'REDIS_PASSWORD',
  'malformed',
);
expectInvalid(
  { REDIS_PASSWORD: 'long enough password' },
  'REDIS_PASSWORD',
  'malformed',
);
expectInvalid(
  { REDIS_URL: 'redis://:different-embedded-passphrase@redis:6379' },
  'REDIS_PASSWORD',
  'conflict',
);

expectInvalid({ JWT_SECRET: undefined }, 'JWT_SECRET', 'missing');
expectInvalid({ JWT_SECRET: 'short' }, 'JWT_SECRET', 'weak_secret');
expectInvalid({ JWT_SECRET: 'REPLACE_WITH_AT_LEAST_32_RANDOM_CHARACTERS' }, 'JWT_SECRET', 'placeholder');
expectInvalid(
  { JWT_SECRET: 'your-super-secret-jwt-key-change-in-production-please' },
  'JWT_SECRET',
  'placeholder',
);
expectInvalid(
  { JWT_SECRET: 'TrackingJWT-known-default-value-that-is-long-enough' },
  'JWT_SECRET',
  'placeholder',
);
expectInvalid({ TTN_WEBHOOK_SECRET: undefined }, 'TTN_WEBHOOK_SECRET', 'missing');
expectInvalid({ TTN_WEBHOOK_SECRET: 'short' }, 'TTN_WEBHOOK_SECRET', 'weak_secret');
expectInvalid(
  { TTN_WEBHOOK_SECRET: 'LoRawan-known-default-value-that-is-long-enough' },
  'TTN_WEBHOOK_SECRET',
  'placeholder',
);
expectInvalid(
  { TTN_WEBHOOK_SECRET: VALID_PRODUCTION_ENV.JWT_SECRET },
  'TTN_WEBHOOK_SECRET',
  'conflict',
);

expectInvalid({ FRONTEND_URL: undefined }, 'FRONTEND_URL', 'missing');
expectInvalid({ FRONTEND_URL: 'http://tram-tracking.rsu.ac.th' }, 'FRONTEND_URL', 'insecure_origin');
expectInvalid({ FRONTEND_URL: 'https://localhost:3000' }, 'FRONTEND_URL', 'local_endpoint');
expectInvalid({ FRONTEND_URL: 'https://tram-tracking.rsu.ac.th/app' }, 'FRONTEND_URL', 'origin_required');
expectInvalid({ FRONTEND_URL: 'https://tram-tracking.rsu.ac.th?mode=prod' }, 'FRONTEND_URL', 'origin_required');
expectInvalid({ FRONTEND_URL: 'https://user:pass@tram-tracking.rsu.ac.th' }, 'FRONTEND_URL', 'origin_required');

expectInvalid({ TRUST_PROXY: undefined }, 'TRUST_PROXY', 'missing');
expectInvalid({ TRUST_PROXY: '1' }, 'TRUST_PROXY', 'unsafe_proxy');
expectInvalid({ TRUST_PROXY: 'true' }, 'TRUST_PROXY', 'unsafe_proxy');
expectInvalid({ TRUST_PROXY: 'loopback' }, 'TRUST_PROXY', 'unsafe_proxy');
expectInvalid({ TRUST_PROXY: '0.0.0.0/0' }, 'TRUST_PROXY', 'unsafe_proxy');
expectInvalid({ TRUST_PROXY: '10.0.0.0/8' }, 'TRUST_PROXY', 'unsafe_proxy');
expectInvalid({ TRUST_PROXY: '::/0' }, 'TRUST_PROXY', 'unsafe_proxy');
expectInvalid({ TRUST_PROXY: '10.20.30.40/32,' }, 'TRUST_PROXY', 'unsafe_proxy');
expectInvalid(
  { TRUST_PROXY: 'REPLACE_WITH_EXACT_PROXY_IP_OR_CIDR' },
  'TRUST_PROXY',
  'placeholder',
);
expectInvalid({ PORT: '0' }, 'PORT', 'malformed');
expectInvalid({ PORT: '3001.5' }, 'PORT', 'malformed');
expectInvalid({ NODE_ENV: ' development ' }, 'NODE_ENV', 'malformed');
expectInvalid({ NODE_ENV: 'staging' }, 'NODE_ENV', 'malformed');

const bracketedIpv6Proxy = parseRuntimeConfig({
  ...VALID_PRODUCTION_ENV,
  TRUST_PROXY: '[::1]/128',
});
assert.deepEqual(bracketedIpv6Proxy.trustProxy, ['::1/128']);

const proxyApp = express();
proxyApp.set('trust proxy', valid.trustProxy);
const compiledProxyPredicate = proxyApp.get('trust proxy fn');
assert.equal(typeof compiledProxyPredicate, 'function');
assert.equal(compiledProxyPredicate('10.20.30.40', 0), true);
assert.equal(compiledProxyPredicate('10.20.30.41', 0), false);

const ipv6ProxyApp = express();
ipv6ProxyApp.set('trust proxy', bracketedIpv6Proxy.trustProxy);
const compiledIpv6ProxyPredicate = ipv6ProxyApp.get('trust proxy fn');
assert.equal(compiledIpv6ProxyPredicate('::1', 0), true);
assert.equal(compiledIpv6ProxyPredicate('2001:db8::1', 0), false);

const validation = spawnSync(
  process.execPath,
  ['dist/config/validate-runtime.js'],
  {
    cwd: process.cwd(),
    env: { ...process.env, ...VALID_PRODUCTION_ENV },
    encoding: 'utf8',
  },
);
assert.equal(validation.status, 0, validation.stderr);
assert.match(validation.stdout, /event=config\.validated/);
assert.equal(`${validation.stdout}\n${validation.stderr}`.includes(VALID_PRODUCTION_ENV.JWT_SECRET), false);

const rejectedValidation = spawnSync(
  process.execPath,
  ['dist/config/validate-runtime.js'],
  {
    cwd: process.cwd(),
    env: { ...process.env, ...VALID_PRODUCTION_ENV, JWT_SECRET: '' },
    encoding: 'utf8',
  },
);
assert.equal(rejectedValidation.status, 1);
assert.match(rejectedValidation.stderr, /variable=JWT_SECRET reason=missing/);
assert.equal(rejectedValidation.stderr.includes(VALID_PRODUCTION_ENV.TTN_WEBHOOK_SECRET), false);

const [serverSource, entrypointSource, rateLimitSource, prismaSource, redisSource] = await Promise.all([
  readFile('src/server.ts', 'utf8'),
  readFile('docker-entrypoint.sh', 'utf8'),
  readFile('src/middleware/rate-limit.ts', 'utf8'),
  readFile('src/config/prisma.ts', 'utf8'),
  readFile('src/config/redis.ts', 'utf8'),
]);

assert.match(serverSource, /app\.set\(['"]trust proxy['"], runtimeConfig\.trustProxy\)/);
assert.match(serverSource, /methods: \[\.\.\.CORS_METHODS\]/);
assert.match(serverSource, /isAllowedRequestOrigin\(origin, runtimeConfig\.frontendOrigins\)/);
assert.match(serverSource, /httpServer\.listen\(runtimeConfig\.port/);
assert.doesNotMatch(serverSource, /process\.env\.FRONTEND_URL/);

assert.match(rateLimitSource, /return req\.ip \|\| 'unknown-client'/);
assert.doesNotMatch(rateLimitSource, /remoteAddress|x-forwarded-for/i);
assert.match(prismaSource, /connectionString: databaseUrl/);
assert.doesNotMatch(prismaSource, /process\.env\.DATABASE_URL/);
assert.match(redisSource, /password: redis\.password/);
assert.doesNotMatch(redisSource, /process\.env\.REDIS_URL/);

const validatorIndex = entrypointSource.indexOf('dist/config/validate-runtime.js');
const migrationIndex = entrypointSource.indexOf('prisma migrate deploy');
assert.notEqual(validatorIndex, -1);
assert.notEqual(migrationIndex, -1);
assert.equal(validatorIndex < migrationIndex, true);

const fakeCommandDirectory = await mkdtemp(join(tmpdir(), 'tram-t9-entrypoint-'));
try {
  const fakeNode = join(fakeCommandDirectory, 'node');
  const fakeNpx = join(fakeCommandDirectory, 'npx');
  await Promise.all([
    writeFile(fakeNode, '#!/bin/sh\nexit 0\n'),
    writeFile(fakeNpx, '#!/bin/sh\nexit 0\n'),
  ]);
  await Promise.all([chmod(fakeNode, 0o700), chmod(fakeNpx, 0o700)]);

  const entrypointDefaultEnvironment = spawnSync(
    'sh',
    ['docker-entrypoint.sh', 'sh', '-c', 'printf "effective-node-env=%s\\n" "$NODE_ENV"'],
    {
      cwd: process.cwd(),
      env: {
        PATH: `${fakeCommandDirectory}:${process.env.PATH ?? ''}`,
      },
      encoding: 'utf8',
    },
  );
  assert.equal(entrypointDefaultEnvironment.status, 0, entrypointDefaultEnvironment.stderr);
  assert.match(entrypointDefaultEnvironment.stdout, /effective-node-env=production/);

  for (const rejectedEnvironment of ['test', ' development ']) {
    const rejectedEntrypointEnvironment = spawnSync(
      'sh',
      ['docker-entrypoint.sh', 'sh', '-c', 'exit 0'],
      {
        cwd: process.cwd(),
        env: {
          PATH: `${fakeCommandDirectory}:${process.env.PATH ?? ''}`,
          NODE_ENV: rejectedEnvironment,
        },
        encoding: 'utf8',
      },
    );
    assert.equal(rejectedEntrypointEnvironment.status, 1);
    assert.match(
      rejectedEntrypointEnvironment.stderr,
      /variable=NODE_ENV reason=unsupported_environment/,
    );
    assert.doesNotMatch(rejectedEntrypointEnvironment.stdout, /migrations\.start/);
  }
} finally {
  await rm(fakeCommandDirectory, { recursive: true, force: true });
}

console.log('T9 production runtime configuration tests passed.');
