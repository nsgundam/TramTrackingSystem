# Repeatable CI and local checks

T4 keeps the current stack and makes the release checks runnable from one command. From the
repository root, install both lockfile-defined dependency sets, then run:

```bash
npm ci --prefix shuttle-tracking-backend
npm ci --prefix shuttle-tracking-web
bash scripts/ci-checks.sh
```

The command blocks on:

- backend TypeScript build, boundary/redaction tests, and `prisma validate`;
- frontend lint and production build;
- development and production Compose parsing with `env.example`; and
- a static check against dynamic error/request/configuration values in backend console calls.

The backend test output includes the `schemaVersion: 1` operational-signal redaction contract
test. Operational events are best-effort JSON lines with a server-generated `correlationId`, stable
event and outcome values, and bounded source/vehicle identifiers. They never include request bodies,
coordinates, URLs, headers, credentials, hashes, or exception messages.

The checks do not start a database, Redis, or application process. The configured pipeline smoke
remains the disposable-stack evidence described in
[`pipeline-smoke-tests.md`](pipeline-smoke-tests.md); vendor monitoring, alert routing, and
production recovery remain outside T4 and are deferred to T9/T13.
