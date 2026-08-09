# Audit Register

Last updated: 2026-08-09

| Phase | Status | Report / evidence | Evidence baseline | Last reviewed | Notes |
|---|---|---|---|---|---|
| Discovery | Complete | `docs/project-knowledge-base.md` | `1eec866` | 2026-08-08 | D-011/D-012 and pinned external Mobile source are current; Android runtime and external infrastructure/device facts remain unavailable. |
| Product | Complete | `docs/audits/product-audit.md` | `378818f` | 2026-08-09 | T14 truth and scoped keyboard journeys are revalidated; human/runtime and Mobile/T11 limits remain. |
| Architecture | Complete | `docs/audits/architecture-audit.md` | `378818f` | 2026-08-09 | One shared focus lifecycle and breakpoint-aware drawer are revalidated; backend/data authority is unchanged. |
| Backend | Complete | `docs/audits/backend-audit.md` | `1eec866` | 2026-08-08 | Current static-secret consumer is evidenced; additive installation/claim/lifecycle and Android acceptance remain blocked. |
| Frontend | Complete | `docs/audits/frontend-audit.md` | `378818f` | 2026-08-09 | Post-accessibility score is 11/20; four more P1s close, three P1s remain, and measurement is next. |
| Database | Complete | `docs/audits/database-audit.md` | `1eec866` | 2026-08-08 | D-012 lifecycle/recovery invariants are approved but absent from schema/runtime; no target action occurred. |
| Infrastructure & Device | Complete | `docs/audits/infrastructure-device-audit.md` | `1eec866` | 2026-08-08 | Native foreground source is visible; build/device/OS evidence is unavailable and ESP32/LoRaWAN facts remain external. |
| Dashboard & UX | Complete | `docs/audits/dashboard-ux-audit.md` | `378818f` | 2026-08-09 | Scoped keyboard journeys pass 4/4; score is 11/20 with contrast, Public explanation, and Research Dashboard P1s open. |
| Security, DevOps & Observability | Complete | `docs/audits/security-devops-observability-audit.md` | `1eec866` | 2026-08-08 | D-012 is approved but unimplemented; SEC-08 records external Mobile credential/backup/cleartext/lifecycle risk. |
| Production Readiness | Complete / No-Go | `docs/audits/production-readiness-audit.md` | `378818f` | 2026-08-09 | Scoped accessibility evidence is accepted; assistive-technology/human/deployed and all release gates remain open. |
| Roadmap | Complete | `docs/roadmap/master-refactoring-roadmap.md` | `378818f` | 2026-08-09 | Truth/accessibility slices are revalidated; measurement-led responsive/performance/visual-system work is next, Admin theme later. |

`Evidence baseline` records the immutable source/decision commit consumed by each report. Each
report's metadata remains authoritative for its full scope and predecessor chain.
