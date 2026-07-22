---
name: tram-audit-workflow
description: Run and coordinate Tram Tracking System discovery, domain re-audits, production readiness, and roadmap synthesis with predecessor, freshness, evidence, and shared-state gates. Use for audit status, planning, execution, validation, or roadmap generation.
---

# Tram Audit Workflow

## Modes

- `Status`: inspect and report state without changing reports.
- `Plan`: detect changed evidence and propose an ordered re-audit plan.
- `Run Next`: execute one next eligible profile.
- `Run Specific`: execute one named profile after validating predecessors.
- `Run All Approved`: execute in order and stop at the first blocker.

## Predecessors

| Profile | Required validated predecessors |
|---|---|
| Discovery | None |
| Product | Discovery |
| Architecture | Discovery, Product |
| Backend / Frontend / Database | Discovery, Product, Architecture |
| Infrastructure & Device | Backend, Frontend, Database |
| Dashboard & UX | Product, Frontend, Infrastructure & Device |
| Security, DevOps & Observability | Backend, Frontend, Database, Infrastructure & Device, Dashboard & UX |
| Production Readiness | Every domain profile above |
| Roadmap | Every validated audit plus approved owner decisions |

Backend, Frontend, and Database are parallel-eligible after Architecture. Never consume a required
predecessor marked `Needs Re-audit` or `Blocked`.

## Domain playbooks

After selecting one profile, read only its mapped playbook. Read both mapped playbooks only when a
finding crosses their boundary.

| Profile | Required playbook |
|---|---|
| Discovery / Product | [Discovery and product](references/discovery-product.md) |
| Architecture | [Architecture and data flow](references/architecture-data-flow.md) |
| Backend | [Backend ingestion and realtime](references/backend-ingestion-realtime.md) |
| Frontend | [Frontend public and admin](references/frontend-public-admin.md) |
| Database | [Telemetry data and retention](references/database-telemetry-retention.md) |
| Infrastructure & Device | [Infrastructure, devices, and field experiments](references/infrastructure-device-field.md) |
| Dashboard & UX | [Dashboard, research, and UX](references/dashboard-research-ux.md) |
| Security, DevOps & Observability | [Security, DevOps, and observability](references/security-devops-observability.md) |
| Production Readiness | [Production readiness](references/production-readiness.md) |

Use the repository-defined research sources consistently: Mobile sends GPS through Socket.IO,
ESP32 plus a GPS module sends over Wi-Fi through HTTP, and a separate LoRaWAN device sends through
a gateway, TTN, and webhook. Treat simulators as test tools rather than a fourth research device.

## Freshness gate

1. Read `docs/audits/README.md`, the selected previous report, and its predecessors.
2. Require evidence baseline, evidence scope, reviewed timestamp, validation state, and predecessor
   baselines. Missing metadata means `Needs Re-audit`.
3. Compare current evidence with `git diff --name-only <baseline>..HEAD -- <evidence paths>`.
4. Mark stale when changed evidence can affect a finding, an approved decision changes assumptions,
   or a required predecessor is stale.
5. Record changed paths and rationale. Dates and file existence alone do not prove freshness.

Agent-contract-only changes do not automatically stale application findings unless they change a
required audit contract.

## Finding states

Use exactly: `Resolved`, `Partially Resolved`, `Still Present`, `No Longer Relevant`,
`Unable to Verify`, or `New Finding`. Revalidate every material prior finding; never silently drop
one or mark it resolved from documentation alone.

## Report contract

Keep domain-specific analysis and include:

```markdown
Audit metadata:
- Evidence baseline: `<full git SHA>`
- Evidence scope: `<repository-relative paths>`
- Reviewed at: `<ISO-8601 timestamp with timezone>`
- Validation state: `Draft` | `Validated` | `Needs Re-audit`
- Predecessor baselines: `<paths and SHAs, or None>`
```

Also include executive summary/scope, prior-finding table, domain analysis, actionable
recommendations, roadmap impact, assumptions/unknowns, confidence, and proposed owner decisions.

## Shared-state ownership

Domain runs write only their profile output and proposed decisions. In coordinator mode only:

1. Validate metadata, evidence, and finding coverage.
2. Mark the report `Validated` and its Audit Register row `Complete`.
3. Merge non-duplicate owner decisions into `docs/decision-queue.md`.
4. Update `docs/audits/lead-audit-summary.md` and identify the next profile.

Level 3 may only downgrade audit status. Level 2 never writes shared queues.

## Agent-change governance

Before changing agent or project-skill contracts, record one approved `AC-xxx` entry with scope,
problem/evidence, exact change, benefit, priority, owner decision, dates, and verification. One entry
may cover an atomic cross-file architecture change.
