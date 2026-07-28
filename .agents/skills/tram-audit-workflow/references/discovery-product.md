# Discovery and Product

## Evidence inventory

- Inventory rider, administrator, developer/researcher, operator, sender, and external-provider
  journeys separately.
- Trace implemented UI, API, Socket.IO events, schema, Redis state, configuration, tests, and
  deployment evidence. Mark physical hardware, firmware, provider, and runtime behavior unavailable
  unless observed.
- Distinguish the three research sources: Mobile/Socket.IO, ESP32+GPS/Wi-Fi/HTTP, and independent
  LoRaWAN/Gateway/TTN/Webhook. Do not count a simulator as a physical source.

## Product audit

- Test whether each core journey can complete without developer intervention and exposes truthful
  loading, empty, stale, failure, recovery, and permission states.
- Separate public rider promises, daily operations, developer research, and future analytics.
- Require a measurable outcome, owner, acceptance signal, privacy boundary, and release stage for
  every proposed capability.
- Confirm that the authenticated Dev Dashboard supports experiments without leaking raw telemetry
  or device controls to public riders.
- Treat accuracy, latency, availability, power, coverage, maintainability, and cost as distinct
  product/research outcomes; do not collapse them into one score without an approved weighting.

## Handoff triggers

Consult Level 2 when experiment design, metric definitions, device trade-offs, or statistical claims
remain uncertain. Return retention, privacy, hardware purchase, and product-scope choices to the
owner.
