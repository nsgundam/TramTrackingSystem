# Audit Register

Last updated: 2026-08-09

| Phase | Status | Report / evidence | Evidence baseline | Last reviewed | Notes |
|---|---|---|---|---|---|
| Discovery | Complete | `docs/project-knowledge-base.md` | `1eec866` | 2026-08-08 | D-011/D-012 and pinned external Mobile source are current; Android runtime and external infrastructure/device facts remain unavailable. |
| Product | Complete | `docs/audits/product-audit.md` | `bd34552` | 2026-08-09 | T14 Feedback/live-state journeys are revalidated; Mobile/T11 and human/runtime limits remain. |
| Architecture | Complete | `docs/audits/architecture-audit.md` | `bd34552` | 2026-08-09 | T14 preserves one canonical authority and validates snapshot/event/PWA transport placement; distributed/runtime evidence remains open. |
| Backend | Complete | `docs/audits/backend-audit.md` | `1eec866` | 2026-08-08 | Current static-secret consumer is evidenced; additive installation/claim/lifecycle and Android acceptance remain blocked. |
| Frontend | Complete | `docs/audits/frontend-audit.md` | `bd34552` | 2026-08-09 | T14 closes two P1 truth defects and narrows Public explanation; current score 10/20, with accessibility/navigation next. |
| Database | Complete | `docs/audits/database-audit.md` | `1eec866` | 2026-08-08 | D-012 lifecycle/recovery invariants are approved but absent from schema/runtime; no target action occurred. |
| Infrastructure & Device | Complete | `docs/audits/infrastructure-device-audit.md` | `1eec866` | 2026-08-08 | Native foreground source is visible; build/device/OS evidence is unavailable and ESP32/LoRaWAN facts remain external. |
| Dashboard & UX | Complete | `docs/audits/dashboard-ux-audit.md` | `bd34552` | 2026-08-09 | Post-T14 score is 10/20; focused journeys pass, two P1s close, and seven P1s remain. |
| Security, DevOps & Observability | Complete | `docs/audits/security-devops-observability-audit.md` | `1eec866` | 2026-08-08 | D-012 is approved but unimplemented; SEC-08 records external Mobile credential/backup/cleartext/lifecycle risk. |
| Production Readiness | Complete / No-Go | `docs/audits/production-readiness-audit.md` | `bd34552` | 2026-08-09 | T14 closes bounded truth gaps; accessibility, operations, deployment, Mobile/device, and every release gate remain open. |
| Roadmap | Complete | `docs/roadmap/master-refactoring-roadmap.md` | `bd34552` | 2026-08-09 | T14's first slice is revalidated; accessibility/navigation is next under a new exact handoff, with Admin theme later. |

`Evidence baseline` records the immutable source/decision commit consumed by each report. Each
report's metadata remains authoritative for its full scope and predecessor chain.
