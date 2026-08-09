# Audit Register

Last updated: 2026-08-09

| Phase | Status | Report / evidence | Evidence baseline | Last reviewed | Notes |
|---|---|---|---|---|---|
| Discovery | Complete | `docs/project-knowledge-base.md` | `1eec866` | 2026-08-08 | D-011/D-012 and pinned external Mobile source are current; Android runtime and external infrastructure/device facts remain unavailable. |
| Product | Needs Re-audit — T14 | `docs/audits/product-audit.md` | `1eec866` | 2026-08-09 | T14 commit `1b2b6c1` changes the Public Feedback and live-state journey; prior Mobile/T11 findings remain independently current. |
| Architecture | Needs Re-audit — T14 | `docs/audits/architecture-audit.md` | `1eec866` | 2026-08-09 | T14 changes frontend snapshot/event reconciliation and PWA realtime transport; T11/D-012 placement remains independently current. |
| Backend | Complete | `docs/audits/backend-audit.md` | `1eec866` | 2026-08-08 | Current static-secret consumer is evidenced; additive installation/claim/lifecycle and Android acceptance remain blocked. |
| Frontend | Needs Re-audit — T14 | `docs/audits/frontend-audit.md` | `1eec866` | 2026-08-09 | T14 implements fail-closed Feedback and truthful Public connection/freshness while preserving the incumbent identity; findings need evidence refresh. |
| Database | Complete | `docs/audits/database-audit.md` | `1eec866` | 2026-08-08 | D-012 lifecycle/recovery invariants are approved but absent from schema/runtime; no target action occurred. |
| Infrastructure & Device | Complete | `docs/audits/infrastructure-device-audit.md` | `1eec866` | 2026-08-08 | Native foreground source is visible; build/device/OS evidence is unavailable and ESP32/LoRaWAN facts remain external. |
| Dashboard & UX | Needs Re-audit — T14 | `docs/audits/dashboard-ux-audit.md` | `1eec866` | 2026-08-09 | T14 changes loading/error/retry/freshness journeys and passes focused desktop/mobile browser checks; the 9/20 baseline must be rescored. |
| Security, DevOps & Observability | Complete | `docs/audits/security-devops-observability-audit.md` | `1eec866` | 2026-08-08 | D-012 is approved but unimplemented; SEC-08 records external Mobile credential/backup/cleartext/lifecycle risk. |
| Production Readiness | Needs Re-audit — T14 | `docs/audits/production-readiness-audit.md` | `1eec866` | 2026-08-09 | Source/browser/CI evidence closes part of the UX truth gap, but No-Go and every external/runtime gate require revalidation. |
| Roadmap | Needs Re-audit — T14 | `docs/roadmap/master-refactoring-roadmap.md` | `1eec866` | 2026-08-09 | T14's first slice is implemented and verified; Level 1 must validate it before selecting the next accessibility/Admin slice. |

`Evidence baseline` records the immutable source/decision commit consumed by each report. Each
report's metadata remains authoritative for its full scope and predecessor chain.
