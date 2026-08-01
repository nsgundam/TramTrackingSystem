# Dashboard & UX Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: 6697acbd62c740039722769588b1c464231e5ce1 plus approved D-009/D-010:A and the current T12 implementation working tree
- Evidence scope: docs/project-knowledge-base.md, Product/Architecture/Backend/Frontend/Infrastructure & Device audits, docs/decision-queue.md, docs/research/, roadmap/task records, shuttle-tracking-web/app/, shuttle-tracking-web/components/, shuttle-tracking-web/hooks/, shuttle-tracking-web/services/, shuttle-tracking-web/types/, shuttle-tracking-web/utils/, and shuttle-tracking-web/tests/
- Reviewed at: 2026-08-01T14:45:45+07:00
- Validation state: Validated
- Predecessor baselines: Product, Frontend, and Infrastructure & Device @ 6697acbd62c740039722769588b1c464231e5ce1 plus their T12 implementation re-audit addenda

## 1. Executive Summary

The repository has three deliberately separate UI audiences: a canonical-only public rider map, an authenticated but limited admin/master-data dashboard, and no current research dashboard. T8 is resolved for the limited rider projection: the map will not present a locally expired/non-live vehicle as live, and tests cover expiry, route switch, and newer-live restoration.

D-001=C requires more than that projection. Riders still do not receive a clear service/no-service/
recovery explanation. T10 supplies Admin route-stop composition; T12 adds source health, feedback
triage, and limited role-specific navigation. Admins still lack trip/history/timeout exceptions and
Mobile recovery.
The research scope remains a future authenticated developer surface and must not be exposed through
public/admin operations pages.

The owner has requested a public-theme Dashboard redesign, but its information hierarchy and visual acceptance belong to T14 after a bounded dashboard brief. T10-T12 must first deliver their respective operations/data-policy contracts; this audit does not authorize an unbounded redesign.

## 2. Scope and Freshness

This profile reviews information architecture, truthfulness, separation of public/operations/research surfaces, loading/error/accessibility states, and task placement. It is not a browser usability study, accessibility certification, user research, device/pilot, or production service test.

Product, Frontend, and Infrastructure & Device are validated at 6697acb plus the D-009 working copy.
T10 adds a focused authenticated route-stop modal; T12 implements D-009's bounded inbox, notice,
retention UX, and safe-health view. No browser usability/accessibility or runtime-retention proof is
claimed.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence and implication |
|---|---|---|
| Public expired/non-live Marker could overstate service | Resolved | T8 canonical projection and synthetic tests remove Marker/count/ETA at expiry and prevent route-switch recurrence until newer live state. |
| Public rider state was fully explanatory | Still Present | Neutral marker/count/ETA behavior does not identify disconnected, stale, no service, dependency failure, last update age, or recovery. |
| Admin live map had no state visibility | Partially Resolved | LiveMap displays connection and live/stale/no-service/unknown counts, including stale last-known visualization. It is not exception-first and has no readiness/action path. |
| Admin dashboard was an accountable operations surface | Still Present | Static green label and master-data counts coexist with no dashboard-level exception summary or recovery actions. Source health and feedback triage now exist as separate pages; route publishing remains separate. |
| Route-stop management journey existed | Resolved | The Routes page presents a route-detail modal for ordered active-stop add/remove/reorder and publish. Build/lint/CI evidence passes; no stateful browser/cache confirmation was run. |
| Feedback capture had staff triage/privacy journey | Partially Resolved | T12 implements notice/receipt, Super Admin/Dev triage, selected reason delete/restore, and safe health fields. No usability/accessibility/human acceptance evidence exists. |
| Research data had an appropriate dashboard | Still Present | No research route/UI has session/source/time filters, metric definitions, sample counts, uncertainty labels, drill-down or bounded export. Existing absence preserves the no-raw-public invariant. |
| Role-specific UX enforced the new hierarchy | Still Present | Current admin UI has no DEV/SUPER_ADMIN/ADMIN capability rendering. It must follow server authorization rather than duplicate policy client-side. |
| Dashboard public-theme direction had a bounded specification | Still Present | Direction is recorded, but exact target screens, priority questions/actions, shared tokens and accessible visual acceptance remain unbounded. T14 owns it. |

## 4. Audience and Information Boundary

| Audience | Allowed present/future information | Prohibited/required separation |
|---|---|---|
| Public rider | Canonical route/stops/live state, neutral ETA, feedback and truthful service messaging. | No source identity, raw telemetry, credentials, research comparison, unrestricted history or admin actions. |
| ADMIN operations | Authorized route publishing, source/device/trip exception and feedback workflow data. | Must be server-authorized; not raw research diagnostic data or higher-privilege deletion/export by default. |
| SUPER_ADMIN/DEV | Approved privileged actions and separate research surfaces. | Controls depend on D-007 pending lifecycle/re-auth/audit/restore policy; no implicit UI authority. |
| Research developer | Session-scoped metrics/aggregates, data definitions, limitations, bounded exports. | Separate route/auth; displayed route conformance and reported accuracy must not be labeled ground truth. |

## 5. Required UX Task Placement

- T10 is complete for its route-detail management scope. Keep the post-save public-read confirmation as an approved-target validation need, not a claim based on modal source alone.
- T11 needs compact authenticated operations paths for active/auto-closed trips, protected history/detail, stale/silent exception, Mobile claim/revoke and audited emergency recovery only after backend APIs and Android acceptance evidence exist. Do not place driver runtime or sender secret entry in Admin UI.
- T12 has D-009 policy. Its feedback inbox/status/assignment and read-only source/device views must render only server-authorized approved actions and clear privacy/retention/deletion/restore controls.
- T14 owns the public-theme Dashboard visual system and hierarchy: its brief must identify questions/actions, system/error states, responsive/accessibility criteria, and research/operations separation before styling work.

## 6. UX Risks and Recommendations

Public map error/retry remains implicit; route/geolocation failures mostly log or alert. The admin dashboard's Live System Active badge is not coupled to readiness or socket health. Admin/public realtime code is duplicated, so their state models may drift. Browser accessibility is not verified; map interaction, icon-only controls, modal focus, colour alone, responsive density, external tiles, and dynamic error announcements need targeted testing before a C-scope claim. Any future research view must show sample count, missingness, p50/p95 definition, units/timezone, retention, excluded data, provenance and uncertainty near aggregates.

## 7. Roadmap Impact, Unknowns, and Confidence

T9 remains blocked by D-008. T10/T12 are complete for exact scopes. T11 needs backend/role/lifecycle
and external Android evidence. T12 usability/accessibility acceptance remains unverified. T14 remains
a separate later task, not a substitute for C-scope operations. No new owner decision is proposed.

Confidence is High for source-visible UI separation and missing journeys, Medium for T8 synthetic journey evidence, and Low for accessibility, user comprehension, real operations, devices, and deployed service behavior.

## 8. Handoff

Dashboard & UX is validated at 671b712. Security, DevOps & Observability is now eligible; it must consume every validated domain report before Production Readiness.

## 9. T12 Implementation Re-audit — 2026-08-01

**Finding: accountable feedback triage and safe source operations were absent from the admin journey
— Partially Resolved.** The admin sidebar now distinguishes a Super Admin/Dev feedback inbox from an
all-admin, read-only source-health surface. The inbox exposes case status, responsible actor, bounded
note, selected deletion reason, restore deadline, and a recent-password confirmation. The health page
has explicit empty/loading/error text and explains that recovery/credential actions do not belong
there. These pages are separate from the existing dashboard, so the static dashboard label and lack of
an exception-first summary remain **Still Present**.

No browser usability, keyboard/focus, screen-reader, role-denial, or staff acceptance run was
authorized. Public service/no-service/recovery communication and the later T14 information hierarchy
remain independent findings.
