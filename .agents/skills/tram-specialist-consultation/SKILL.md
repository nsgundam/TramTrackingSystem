---
name: tram-specialist-consultation
description: Select the smallest sufficient specialist playbook set and produce immutable, task-keyed Level 2 decision briefs for Tram Tracking System product, research, telemetry, device, security, data, dashboard, or implementation questions.
---

# Tram Specialist Consultation

Read `agents/level-2-specialist/AGENT.md` before consultation.

## Gate and routing

Require one focused question, task/audit ID, triggering finding, exact evidence paths, validated
audit context, constraints, and expected output path. Stop rather than run a general subsystem audit.

Route by concern and read only the linked playbook for that question:

| Evidence or concern | Playbook |
|---|---|
| Product outcome, experiment question, protocol, comparison fairness | [Product and research design](references/product-research-design.md) |
| Accuracy, route distance, ground truth, statistics, GPS quality | [Telemetry and geospatial analysis](references/telemetry-geospatial-analysis.md) |
| Phone GPS, background location, Socket.IO sender | [Mobile and Socket.IO](references/mobile-socketio.md) |
| ESP32, GPS module, Wi-Fi, HTTP, firmware | [ESP32 and HTTP](references/esp32-http.md) |
| Gateway, TTN, payload codec, webhook, radio metadata | [LoRaWAN and TTN](references/lorawan-ttn.md) |
| Express, ingestion, validation, canonical selection, realtime | [Backend ingestion and realtime](references/backend-ingestion-realtime.md) |
| Prisma, PostgreSQL/PostGIS, Redis, retention, aggregation | [PostgreSQL, Redis, and retention](references/postgres-redis-retention.md) |
| Next.js/React, maps, charts, filtering, research export | [Developer dashboard and visualization](references/developer-dashboard-visualization.md) |
| Authentication, authorization, provisioning, privacy, export | [Identity, security, and privacy](references/identity-security-privacy.md) |
| Metrics, logs, field failures, alerts, reproducibility | [Observability and field testing](references/observability-field-testing.md) |

Default to one playbook per question. Read at most two only when one binding question has inseparable
concerns; identify one as primary and one as supporting. Otherwise split independent concerns into
separate questions and briefs. A decision is binding only for its stated question.

## Research evidence

For version-sensitive, hardware, security, protocol, or tool-selection questions:

1. Inspect repository versions and constraints first.
2. Research current primary sources: official documentation, standards, vendor datasheets/security
   advisories, and original research papers. Record URLs, versions, and access date.
3. Separate repository evidence, external-source facts, field evidence, and inference.
4. Compare compatibility, measurement validity, cost, power, coverage, operations, migration risk,
   privacy, and MVP fit. Do not recommend replacement only because a tool is newer.
5. Mark claims unverified when no physical device, provider runtime, synchronized clock, or ground
   truth was observed.

## Brief

Write one immutable file:

`docs/audits/specialized/<task-or-audit-id>-<domain>-<topic>.md`

Include:

1. Trigger and current evidence.
2. Recommended decision.
3. Alternatives and trade-offs, including primary-source citations when research was required.
4. MVP rationale.
5. Exact repository-relative implementation handoff and tests.
6. Failure modes, compatibility, migration/rollout risks.
7. Open questions and proposed owner decisions.
8. Evidence classification, research date, assumptions, confidence, and validation plan.

Never append unrelated decisions to a domain-wide file. For a revision, add `-v2` and link the
superseded brief. Return owner-controlled choices to Level 1; do not edit the Decision Queue.

If specialist constraints conflict, stop and present the conflict with evidence.
