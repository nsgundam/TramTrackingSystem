import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const composePath = resolve(repositoryRoot, "docker-compose.prod.yml");
const examplePath = resolve(repositoryRoot, "env.production.example");

const rendered = spawnSync(
  "docker",
  [
    "compose",
    "--env-file",
    examplePath,
    "-f",
    composePath,
    "config",
    "--format",
    "json",
  ],
  { cwd: repositoryRoot, encoding: "utf8" },
);

assert.equal(rendered.status, 0, "production Compose must render with the sanitized example");
assert.ok(rendered.stdout.trim(), "production Compose must produce a JSON model");

const model = JSON.parse(rendered.stdout);
const { services, networks } = model;

const networkNames = (service) => Object.keys(service.networks ?? {}).sort();
const assertLoopbackPort = (service, expectedPort) => {
  assert.equal(service.ports?.length, 1);
  assert.equal(service.ports[0].host_ip, "127.0.0.1");
  assert.equal(Number(service.ports[0].target), expectedPort);
  assert.equal(Number(service.ports[0].published), expectedPort);
};

assert.ok(services.db);
assert.ok(services.redis);
assert.ok(services.backend);
assert.ok(services.frontend);

assert.equal(services.db.ports, undefined, "PostgreSQL must not publish a host port");
assert.equal(services.redis.ports, undefined, "Redis must not publish a host port");
assert.equal(
  services.redis.user,
  "redis",
  "the Redis shell and server must run as the image's non-root user",
);
assert.deepEqual(networkNames(services.db), ["data"]);
assert.deepEqual(networkNames(services.redis), ["data"]);
assert.equal(networks.data.internal, true, "the data network must be internal");
assert.deepEqual(networkNames(services.frontend), ["edge"]);
assert.deepEqual(networkNames(services.backend), ["data", "edge"]);

assertLoopbackPort(services.backend, 3001);
assertLoopbackPort(services.frontend, 3000);

const redisCommand = (services.redis.command ?? []).join("\n");
const redisHealth = (services.redis.healthcheck?.test ?? []).join("\n");
assert.match(redisCommand, /requirepass/);
assert.match(redisCommand, /\$\$REDIS_PASSWORD/);
assert.match(redisHealth, /\$\$REDIS_PASSWORD/);
assert.match(redisHealth, /REDISCLI_AUTH/);
assert.doesNotMatch(redisHealth, /(?:^|\s)-a(?:\s|$)/);
assert.equal(services.backend.environment.REDIS_URL, "redis://redis:6379");
assert.ok(services.backend.environment.REDIS_PASSWORD);

const backendHealth = (services.backend.healthcheck?.test ?? []).join("\n");
const frontendHealth = (services.frontend.healthcheck?.test ?? []).join("\n");
assert.match(backendHealth, /\/ready/);
assert.match(frontendHealth, /127\.0\.0\.1:3000/);
assert.equal(services.frontend.depends_on.backend.condition, "service_healthy");
assert.equal(services.backend.depends_on.db.condition, "service_healthy");
assert.equal(services.backend.depends_on.redis.condition, "service_healthy");

assert.match(services.backend.image, /^tram-tracking-backend:/);
assert.match(services.frontend.image, /^tram-tracking-frontend:/);
assert.equal(
  services.backend.image.split(":").at(-1),
  services.frontend.image.split(":").at(-1),
  "frontend and backend must use one release identifier",
);

const frontendModel = JSON.stringify({
  environment: services.frontend.environment ?? {},
  buildArgs: services.frontend.build?.args ?? {},
});
for (const serverSecret of [
  "DATABASE_URL",
  "POSTGRES_PASSWORD",
  "REDIS_PASSWORD",
  "JWT_SECRET",
  "TTN_WEBHOOK_SECRET",
]) {
  assert.equal(
    frontendModel.includes(serverSecret),
    false,
    `${serverSecret} must not enter frontend build or runtime variables`,
  );
}

const composeSource = readFileSync(composePath, "utf8");
for (const requiredVariable of [
  "APP_VERSION",
  "POSTGRES_USER",
  "POSTGRES_PASSWORD",
  "POSTGRES_DB",
  "DATABASE_URL",
  "REDIS_PASSWORD",
  "JWT_SECRET",
  "FRONTEND_URL",
  "TRUST_PROXY",
  "TTN_WEBHOOK_SECRET",
]) {
  assert.match(
    composeSource,
    new RegExp(`\\$\\{${requiredVariable}:\\?`),
    `${requiredVariable} must be required without a production default`,
  );
}

const exampleVariables = Object.fromEntries(
  readFileSync(examplePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => {
      const separator = line.indexOf("=");
      return [line.slice(0, separator), line.slice(separator + 1)];
    }),
);

for (const placeholderVariable of [
  "APP_VERSION",
  "POSTGRES_PASSWORD",
  "REDIS_PASSWORD",
  "JWT_SECRET",
  "TTN_WEBHOOK_SECRET",
  "TRUST_PROXY",
]) {
  assert.match(
    exampleVariables[placeholderVariable],
    /^REPLACE_WITH_/,
    `${placeholderVariable} must remain a non-secret placeholder`,
  );
}
assert.match(exampleVariables.DATABASE_URL, /REPLACE_WITH_/);
assert.match(exampleVariables.FRONTEND_URL, /^https:\/\//);
assert.doesNotMatch(exampleVariables.FRONTEND_URL, /localhost|127\.0\.0\.1|\[::1\]/i);

console.log("T9 production topology checks passed");
