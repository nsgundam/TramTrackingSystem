# University Server/Network Production Handoff

This runbook is the application-team delivery contract for the intended single university-managed
host and preferred origin `https://tram-tracking.rsu.ac.th`. It is not a record that deployment,
migration, restore, TLS, alerting, or capacity validation has happened.

## 1. Release and responsibility record

Complete this record for every candidate release and retain it with the deployment evidence:

| Field | Required value |
|---|---|
| Release / `APP_VERSION` | Immutable version or Git SHA; never `latest` |
| Git commit | Full source commit SHA |
| Frontend image | Tag plus image digest |
| Backend image | Tag plus image digest |
| Compose bundle | File checksum and repository commit |
| Release notes | Changed behavior, config changes, migrations, known limitations |
| Migration review | Migration names, compatibility window, backup prerequisite, database-recovery limit |
| Approved rollback artifact | Previous frontend/backend tags and digests retained locally or in the approved registry |
| Application acceptance | Name, date, artifact and migration acceptance |
| Server/Network acceptance | Primary name/contact, backup name/contact, date, infrastructure/recovery/operations acceptance |
| Release window | Outside vehicle service hours unless both owners approve otherwise |

The application team owns versioned artifacts, the non-secret environment schema, migration
procedure, health semantics, release notes, and application validation. The University
Server/Network Team owns the host and OS, administrator network, firewall, reverse proxy, public IP
or NAT, DNS, TLS and renewal, deployed secrets, off-host backup/restore, log/metric retention,
alerts, named incident contacts, and infrastructure rollback. Each owner signs only their evidence.

## 2. Required external facts

Record, do not infer:

- host name, OS/version, CPU, RAM, durable-disk size/free-space threshold, bandwidth, public IP/NAT;
- restricted administrator network and named SSH administrators;
- exact address or CIDR from which the trusted reverse proxy reaches the backend;
- DNS approval and owner for `tram-tracking.rsu.ac.th`;
- certificate issuer, issuance/renewal method, renewal owner, and expiry-alert destination;
- production environment/secret-file owner and rotation procedure;
- off-host backup destination, access owner, schedule, retention, and deletion procedure; and
- log/metric destination, retention/access policy, primary/backup contacts, and incident channel.

Until these are completed and accepted, the corresponding checks in Section 10 remain
`Unavailable — external target/operator required`.

## 3. Secret and environment boundary

Use [`env.production.example`](../../env.production.example) only as a schema. The real file stays
outside the repository and images, is owned by root or the deployment service account, and has mode
`0600`:

```sh
install -d -m 0750 -o root -g root /etc/tram-tracking
install -m 0644 -o root -g root env.production.example /etc/tram-tracking/production.env.example
if [ ! -e /etc/tram-tracking/production.env ]; then
  install -m 0600 -o root -g root /dev/null /etc/tram-tracking/production.env
fi
chmod 600 /etc/tram-tracking/production.env
```

The first command may refresh only the non-secret `.example`. It must never overwrite an existing
`production.env`. If an approved deployment service account owns the real file instead of root,
change ownership explicitly and retain `0600`.

Replace every `REPLACE_WITH_...` value before any start. Generate JWT, TTN, Redis, and PostgreSQL
secrets independently. `DATABASE_URL` must carry the same PostgreSQL password, percent-encoded when
it contains URL-reserved characters. Generate `REDIS_PASSWORD` as a base64url or hex token using
only letters, digits, `_`, and `-`, with no padding or whitespace, so it remains one Redis
configuration token. Never place a secret in `NEXT_PUBLIC_*`, Git, an image build
argument, release notes, a command transcript, or chat. Prefer the university secret manager; a
`0600` file is the fallback approved by D-008.

`TRUST_PROXY` must be the actual IP or CIDR of the last trusted reverse proxy as seen by the backend.
Do not use `true`, a hop count, `0.0.0.0/0`, `::/0`, or a guessed Docker range. The backend refuses
production startup when required values remain missing, unsafe, local, or placeholders.

Static preflight (safe; does not start services):

```sh
docker compose --env-file /etc/tram-tracking/production.env -f docker-compose.prod.yml config --quiet
node scripts/test-production-topology.mjs
```

The second command validates repository structure with the tracked example. It does not validate
the deployed secrets, host firewall, or proxy.

## 4. Network and reverse-proxy contract

The host firewall exposes only `443/tcp`; `80/tcp` may exist only for HTTPS redirect. SSH is limited
to the approved administrator network. Compose binds frontend `3000` and backend `3001` to
`127.0.0.1`; PostgreSQL `5432` and Redis `6379` have no host binding.

The TLS reverse proxy must preserve one public origin and route:

| Public path | Upstream | Requirements |
|---|---|---|
| `/` | `http://127.0.0.1:3000` | Preserve host and forwarding headers |
| `/api/*` | `http://127.0.0.1:3001` | Preserve method/body; allow authenticated `PUT`, `PATCH`, `DELETE` |
| `/socket.io/*` | `http://127.0.0.1:3001` | HTTP/1.1, `Upgrade`/`Connection` headers, long-lived WebSocket timeout |
| `/ready` | backend-internal only | Monitor locally; do not publish unless the Server/Network Team explicitly protects it |

Set `Host`, `X-Forwarded-Proto`, and append `X-Forwarded-For` at the proxy. The backend accepts the
exact `FRONTEND_URL` for browser CORS and uses Express's trusted-proxy calculation for rate-limit
identity. CORS is not authentication.

## 5. Versioned build and pre-migration release gate

1. Confirm the release record, responsibility acceptance, target facts, maintenance window, and
   retained rollback images.
2. Run repository CI on the exact Git commit and retain the result.
3. Render Compose with `config --quiet`; never attach or paste rendered configuration because it
   contains secrets.
4. Build or pull the images and record immutable digests:

   ```sh
   set -eu
   rendered_images="$(docker compose --env-file /etc/tram-tracking/production.env -f docker-compose.prod.yml config --images)"
   backend_image="$(printf '%s\n' "$rendered_images" | awk '/^tram-tracking-backend:/{print; exit}')"
   frontend_image="$(printf '%s\n' "$rendered_images" | awk '/^tram-tracking-frontend:/{print; exit}')"
   test -n "$backend_image" && test -n "$frontend_image"
   test "${backend_image#tram-tracking-backend:}" = "${frontend_image#tram-tracking-frontend:}"
   docker compose --env-file /etc/tram-tracking/production.env -f docker-compose.prod.yml build --pull
   docker image inspect "$backend_image" --format '{{.Id}}'
   docker image inspect "$frontend_image" --format '{{.Id}}'
   ```

   Record the immutable image IDs. If the university uses a registry, also record the registry
   digest after push/pull; do not substitute a mutable tag for either identifier.

5. Run the configuration validator without migration, then stop if it fails:

   ```sh
   docker compose --env-file /etc/tram-tracking/production.env -f docker-compose.prod.yml run --rm --no-deps --entrypoint node backend dist/config/validate-runtime.js
   ```

6. Take and verify the pre-migration off-host backup in Section 6. Review whether every Prisma
   migration is backward-compatible with the retained application artifact.

The normal backend entrypoint validates again before `prisma migrate deploy`. A successful
migration is not evidence that an older application can safely use the new schema.

## 6. Backup and disposable restore procedure

Initial target: daily successful off-host PostgreSQL backup, RPO at most 24 hours, and RTO before the
next service period and at most 24 hours. The backup destination must not be the production host.

Example dump command, executed by the Server/Network Team with an approved off-host mounted path:

```sh
set -eu
umask 077
backup_directory=/approved-off-host/tram-tracking
install -d -m 0700 "$backup_directory"
backup_file="$backup_directory/tram-tracking-$(date -u +%Y%m%dT%H%M%SZ).dump"
partial_file="${backup_file}.partial"
trap 'rm -f "$partial_file"' EXIT HUP INT TERM
docker compose --env-file /etc/tram-tracking/production.env -f docker-compose.prod.yml exec -T db sh -c 'exec pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --format=custom' > "$partial_file"
test -s "$partial_file"
mv "$partial_file" "$backup_file"
trap - EXIT HUP INT TERM
sha256sum "$backup_file" > "$backup_file.sha256"
stat -c 'mode=%a owner=%U:%G file=%n' "$backup_file" "$backup_file.sha256"
```

Record timestamp, size, checksum, destination, retention expiry, command status, and operator. A
file existing is not restore proof.

Restore only to an explicitly approved disposable PostgreSQL/PostGIS target. Keep its password in a
`0600` pgpass file rather than the command line:

```sh
restore_host='SET_DISPOSABLE_HOST'
restore_port='5432'
restore_user='SET_DISPOSABLE_USER'
restore_database='SET_DISPOSABLE_DATABASE'
PGPASSFILE=/approved-secret-path/disposable.pgpass pg_restore --exit-on-error --clean --if-exists --no-owner --host "$restore_host" --port "$restore_port" --username "$restore_user" --dbname "$restore_database" "$backup_file"
PGPASSFILE=/approved-secret-path/disposable.pgpass psql --host "$restore_host" --port "$restore_port" --username "$restore_user" --dbname "$restore_database" -c 'SELECT PostGIS_Version();'
```

Post-restore validation must record:

- checksum match and restore duration within RTO;
- Prisma migration status for the release and successful PostGIS query;
- expected non-secret row counts/integrity for admins, routes, stops, vehicles, tracking sources,
  canonical/history and feedback tables without exporting sensitive rows;
- backend `/ready` against only the disposable database/Redis target;
- authenticated admin login/read and public routes/active-vehicle response shape; and
- safe stale/no-service state until a new accepted observation rebuilds live Redis-backed state.

Never restore onto production as a test. This repository run did not execute either command.

## 7. Migration, start, and deployed-version verification

After backup and approval, an operator may separate migration observation from service start:

```sh
docker compose --env-file /etc/tram-tracking/production.env -f docker-compose.prod.yml up -d --wait db redis
docker compose --env-file /etc/tram-tracking/production.env -f docker-compose.prod.yml run --rm --no-deps --entrypoint npx backend prisma migrate deploy
docker compose --env-file /etc/tram-tracking/production.env -f docker-compose.prod.yml up -d --wait backend frontend
docker compose --env-file /etc/tram-tracking/production.env -f docker-compose.prod.yml ps
```

The backend entrypoint runs the idempotent deploy command again before application start. Confirm
the running container image IDs/digests match the release record, both healthchecks become healthy,
and no seed runs in production. Retain redacted command results; do not retain environment output.

## 8. Rollback boundary

- **Application rollback:** redeploy the retained frontend/backend tags only when the migration
  review confirms that version remains schema-compatible.
- **Database recovery:** Prisma has no automatic down migration in this runbook. If the schema/data
  change is incompatible, stop writes, obtain joint approval, restore the verified pre-migration
  backup to an approved target, validate it, then perform the documented cutover/rollback.
- **VPS recovery:** an external VPS is manual cold recovery only. It is not failover or HA until a
  later rehearsal records restore, artifact/secret reconstruction, DNS cutover, validation, and
  rollback.

Record the decision, operator, start/end time, data-loss window, validation, and incident link.

## 9. Monitoring and incident minimum

The Server/Network Team must retain application stdout/stderr in an access-controlled durable sink
and monitor host availability, disk pressure, container restarts, backend `/ready`, PostgreSQL,
Redis, certificate expiry, backup completion, and restore age. Test delivery for host down,
readiness failure, disk pressure, PostgreSQL failure, and Redis failure to both primary and backup
contacts. Process-local logs or a green healthcheck alone are insufficient.

Planned maintenance belongs outside tram service hours. For an incident, the named operator records
start time, impact, artifact version, last successful backup, actions, recovery validation, and
follow-up owner. Rider/public communication policy is outside this runbook.

## 10. External acceptance checklist

Every row starts unavailable. Attach redacted evidence and both owners' acceptance before changing
status.

| Check | Required evidence | Initial status |
|---|---|---|
| Responsibility | Written responsibility table acceptance plus named primary/backup contacts | Unavailable — external owner required |
| Host/network | Actual OS/resources/bandwidth/public-IP or NAT/admin network/firewall facts | Unavailable — external target required |
| DNS/TLS | DNS approval, valid certificate, automatic renewal and tested expiry alert | Unavailable — external target required |
| Public ports | External scan shows only `80/443`; not `3000/3001/5432/6379` | Unavailable — external target required |
| One-origin REST/WSS | HTTPS REST and WSS work at the preferred origin; authenticated admin `PUT`/`DELETE` pass | Unavailable — external target required |
| Secrets/config | Actual store/owner/rotation, file access, no placeholder/localhost production value | Unavailable — external owner required |
| Backup/restore | Daily off-host schedule/retention plus disposable restore within accepted RPO/RTO and post-restore checks | Unavailable — external target required |
| Logs/alerts | Actual sink/retention/access plus successful host/readiness/disk/PostgreSQL/Redis alerts to both contacts | Unavailable — external target required |
| Restart/live safety | Host/service restart preserves PostgreSQL and shows stale/no-service until new observations rebuild live state | Unavailable — external target required |
| Capacity | Defined-duration test for 10 reporting vehicles and 10,000 concurrent viewers with latency/error/resource/reconnect thresholds | Unavailable — external target required |
| Cold VPS, if claimed | Manual restore, matching artifact/extensions/secrets, DNS cutover, validation and rollback rehearsal | Unavailable — external target required |
| Demo isolation | Vercel/Render/Neon demo uses separate credentials, database, senders and synthetic/test data; no production access | Unavailable — owner/provider evidence required |

Repository CI, Compose parsing, image build, simulator output, or a cloud-console screenshot cannot
replace these results. Production release remains a no-go until the required external acceptance is
complete.
