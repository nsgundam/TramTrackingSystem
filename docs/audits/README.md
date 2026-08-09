# Audit Register

Last updated: 2026-08-09

| Phase | Status | Report / evidence | Evidence baseline | Last reviewed | Notes |
|---|---|---|---|---|---|
| Discovery | Complete | `docs/project-knowledge-base.md` | `1eec866` | 2026-08-08 | D-011/D-012 and pinned external Mobile source are current; Android runtime and external infrastructure/device facts remain unavailable. |
| Product | Needs Re-audit — T14 contrast governance | `docs/audits/product-audit.md` | `7aae795` | 2026-08-09 | Commit `799905f` changes scoped Public/Admin foreground and route-color presentation; Mobile/T11 remains independent. |
| Architecture | Needs Re-audit — T14 contrast governance | `docs/audits/architecture-audit.md` | `7aae795` | 2026-08-09 | T14 adds one display-color/contrast boundary and shared badge owner; backend/data authority is unchanged. |
| Backend | Complete | `docs/audits/backend-audit.md` | `1eec866` | 2026-08-08 | Current static-secret consumer is evidenced; additive installation/claim/lifecycle and Android acceptance remain blocked. |
| Frontend | Needs Re-audit — T14 contrast governance | `docs/audits/frontend-audit.md` | `7aae795` | 2026-08-09 | Contrast unit 4/4 and browser 2/2 pass; P1 state and technical score require refresh. |
| Database | Complete | `docs/audits/database-audit.md` | `1eec866` | 2026-08-08 | D-012 lifecycle/recovery invariants are approved but absent from schema/runtime; no target action occurred. |
| Infrastructure & Device | Complete | `docs/audits/infrastructure-device-audit.md` | `1eec866` | 2026-08-08 | Native foreground source is visible; build/device/OS evidence is unavailable and ESP32/LoRaWAN facts remain external. |
| Dashboard & UX | Needs Re-audit — T14 contrast governance | `docs/audits/dashboard-ux-audit.md` | `7aae795` | 2026-08-09 | Measured Public light-surface and route-badge contrast passes without layout/theme redesign; rescore required. |
| Security, DevOps & Observability | Complete | `docs/audits/security-devops-observability-audit.md` | `1eec866` | 2026-08-08 | D-012 is approved but unimplemented; SEC-08 records external Mobile credential/backup/cleartext/lifecycle risk. |
| Production Readiness | Needs Re-audit — T14 contrast governance / No-Go | `docs/audits/production-readiness-audit.md` | `7aae795` | 2026-08-09 | Synthetic contrast evidence changed; human/assistive-technology/deployed/release gates remain open. |
| Roadmap | Needs Re-audit — T14 contrast governance | `docs/roadmap/master-refactoring-roadmap.md` | `7aae795` | 2026-08-09 | Implementation `799905f` passes full CI; Level 1 must revalidate before selecting Admin theme or another T14 slice. |

`Evidence baseline` records the immutable source/decision commit consumed by each report. Each
report's metadata remains authoritative for its full scope and predecessor chain.
