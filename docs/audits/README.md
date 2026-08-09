# Audit Register

Last updated: 2026-08-09

| Phase | Status | Report / evidence | Evidence baseline | Last reviewed | Notes |
|---|---|---|---|---|---|
| Discovery | Complete | `docs/project-knowledge-base.md` | `1eec866` | 2026-08-08 | D-011/D-012 and pinned external Mobile source are current; Android runtime and external infrastructure/device facts remain unavailable. |
| Product | Needs Re-audit — T14 accessibility | `docs/audits/product-audit.md` | `bd34552` | 2026-08-09 | Commit `8baa274` changes Public document/Feedback/image and Admin navigation accessibility behavior; Mobile/T11 remains independent. |
| Architecture | Needs Re-audit — T14 accessibility | `docs/audits/architecture-audit.md` | `bd34552` | 2026-08-09 | T14 adds one shared modal-focus boundary and breakpoint-aware drawer semantics; backend/data authority is unchanged. |
| Backend | Complete | `docs/audits/backend-audit.md` | `1eec866` | 2026-08-08 | Current static-secret consumer is evidenced; additive installation/claim/lifecycle and Android acceptance remain blocked. |
| Frontend | Needs Re-audit — T14 accessibility | `docs/audits/frontend-audit.md` | `bd34552` | 2026-08-09 | T14 implements root/dialog/form/focus/Mobile-drawer corrections with 4/4 browser evidence; findings must be rescored. |
| Database | Complete | `docs/audits/database-audit.md` | `1eec866` | 2026-08-08 | D-012 lifecycle/recovery invariants are approved but absent from schema/runtime; no target action occurred. |
| Infrastructure & Device | Complete | `docs/audits/infrastructure-device-audit.md` | `1eec866` | 2026-08-08 | Native foreground source is visible; build/device/OS evidence is unavailable and ESP32/LoRaWAN facts remain external. |
| Dashboard & UX | Needs Re-audit — T14 accessibility | `docs/audits/dashboard-ux-audit.md` | `bd34552` | 2026-08-09 | Dialog/form/sidebar P1s changed materially; focused keyboard journeys pass 4/4 and detector returns `[]`. |
| Security, DevOps & Observability | Complete | `docs/audits/security-devops-observability-audit.md` | `1eec866` | 2026-08-08 | D-012 is approved but unimplemented; SEC-08 records external Mobile credential/backup/cleartext/lifecycle risk. |
| Production Readiness | Needs Re-audit — T14 accessibility / No-Go | `docs/audits/production-readiness-audit.md` | `bd34552` | 2026-08-09 | Source/browser evidence closes part of the accessibility gap; human/deployed/release gates still require revalidation. |
| Roadmap | Needs Re-audit — T14 accessibility | `docs/roadmap/master-refactoring-roadmap.md` | `bd34552` | 2026-08-09 | Accessibility/navigation is implemented at `8baa274`; Level 1 must revalidate before selecting Admin theme or another slice. |

`Evidence baseline` records the immutable source/decision commit consumed by each report. Each
report's metadata remains authoritative for its full scope and predecessor chain.
