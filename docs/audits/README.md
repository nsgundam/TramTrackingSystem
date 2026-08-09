# Audit Register

Last updated: 2026-08-10

| Phase | Status | Report / evidence | Evidence baseline | Last reviewed | Notes |
|---|---|---|---|---|---|
| Discovery | Complete | `docs/project-knowledge-base.md` | `1eec866` | 2026-08-08 | D-011/D-012 and pinned external Mobile source are current; Android runtime and external infrastructure/device facts remain unavailable. |
| Product | Complete | `docs/audits/product-audit.md` | `db72310` | 2026-08-10 | Six T14 journeys are revalidated; Public explanation is resolved for bounded source/browser evidence and Mobile/T11 remain partial/blocked. |
| Architecture | Complete | `docs/audits/architecture-audit.md` | `db72310` | 2026-08-10 | Public state/recovery presentation reuses current typed authorities; backend/data contracts are unchanged. |
| Backend | Complete | `docs/audits/backend-audit.md` | `1eec866` | 2026-08-08 | Current static-secret consumer is evidenced; additive installation/claim/lifecycle and Android acceptance remain blocked. |
| Frontend | Complete | `docs/audits/frontend-audit.md` | `db72310` | 2026-08-10 | Public recovery passes focused/full CI; score remains 15/20 with one P1, eight P2, and one P3 open. |
| Database | Complete | `docs/audits/database-audit.md` | `1eec866` | 2026-08-08 | D-012 lifecycle/recovery invariants are approved but absent from schema/runtime; no target action occurred. |
| Infrastructure & Device | Complete | `docs/audits/infrastructure-device-audit.md` | `1eec866` | 2026-08-08 | Native foreground source is visible; build/device/OS evidence is unavailable and ESP32/LoRaWAN facts remain external. |
| Dashboard & UX | Complete | `docs/audits/dashboard-ux-audit.md` | `db72310` | 2026-08-10 | Eight P1/two P2 are resolved; the remaining Research P1 is T13-blocked and Admin theme convergence is next. |
| Security, DevOps & Observability | Complete | `docs/audits/security-devops-observability-audit.md` | `1eec866` | 2026-08-08 | D-012 is approved but unimplemented; SEC-08 records external Mobile credential/backup/cleartext/lifecycle risk. |
| Production Readiness | Complete / No-Go | `docs/audits/production-readiness-audit.md` | `db72310` | 2026-08-10 | Public source/browser evidence is revalidated; human/assistive-technology/deployed/release gates remain open. |
| Roadmap | Complete / Validated | `docs/roadmap/master-refactoring-roadmap.md` | `db72310` | 2026-08-10 | First six T14 slices are revalidated; bounded Admin master-data theme convergence is next. |

`Evidence baseline` records the immutable source/decision commit consumed by each report. Each
report's metadata remains authoritative for its full scope and predecessor chain.
