# Device Pipeline Smoke Tests

These commands exercise the existing single ingestion pipeline on a local development stack.
They are controlled-MVP evidence only; they do not prove a real mobile application, TTN provider,
or physical device deployment.

## Fixture contract

The development seed is the source of truth. Keep the non-secret values in `.env` aligned with it:

| Source | Type | Vehicle | Credential variable |
|---|---|---|---|
| `TS_MOB_01` | mobile | `VH001` | `TRACKING_SOURCE_SECRET_MOBILE` |
| `TS_ESP_01` | esp32 | `VH001` | `TRACKING_SOURCE_SECRET_ESP32` |
| `sensor-c4` | lorawan | `VH003` | `TTN_WEBHOOK_SECRET` |
| `sensor-f2` | lorawan | `VN002` | `TTN_WEBHOOK_SECRET` |

Copy `env.example` to the ignored repository-root `.env`, then set local-only values for
`SEED_ADMIN_PASSWORD`, `JWT_SECRET`, `TTN_WEBHOOK_SECRET`,
`TRACKING_SOURCE_SECRET_MOBILE`, and `TRACKING_SOURCE_SECRET_ESP32`. Do not put real credentials in
this document or any checked-in fixture.

## Disposable Compose stack

Run from the repository root:

```bash
docker compose --env-file .env config --quiet
docker compose --env-file .env up -d --build
docker compose --env-file .env exec backend npx prisma db seed
```

The seed command is safe to rerun for the development fixtures. Use a disposable Compose project
or volume for this evidence so test trips and cached locations do not affect another local session.
After the evidence is captured, remove only that disposable stack and its volumes:

```bash
docker compose --env-file .env down -v
```

Do not use the volume-removal command against a shared or production-like environment.

## Mobile Socket.IO smoke

This performs sender authentication, trip setup, one Socket.IO observation, canonical selection,
and checks the safe `{ ok: true, canonicalLocation }` acknowledgement. It exits after one update:

```bash
node --env-file=.env shuttle-tracking-web/simulate.js --once
```

Expected output includes `Socket ACK ok=true`, `source=TS_MOB_01`, and `type=mobile`. The simulator
does not print the mobile source secret or the sender token.

## TTN webhook smoke

This performs TTN bearer authentication, one normalized webhook observation, canonical selection,
and a safe response summary. `sensor-c4` is the default seed-aligned device; use `sensor-f2` to
exercise the other seeded LoRaWAN mapping:

```bash
node shuttle-tracking-backend/simulate-ttn.js sensor-c4 --once
node shuttle-tracking-backend/simulate-ttn.js sensor-f2 --once
```

Expected output includes an HTTP 200 response with `sourceType=lorawan` and the selected seeded
device ID. The simulator prints only status/message/canonical identity fields, never the webhook
secret.

## Full configured pipeline evidence

After the two focused checks, run the existing backend pipeline test. It verifies the configured
seed rows, rejected unauthenticated/invalid/mismatched writes, ESP32 and mobile HTTP ingestion,
TTN ingestion, priority selection, analytics, database history, and credential-free acknowledgements:

```bash
node shuttle-tracking-backend/test_pipeline.js
```

The script fails early when required credentials are absent or when the database rows do not match
the fixture contract. Its output contains statuses and identifiers only; it does not print source
secrets, password values, or credential hashes.

No MQTT consumer, provider-specific pipeline, schema migration, or additional transport is needed
for these smoke tests.
