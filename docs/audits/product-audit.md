# Product Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: `6697acbd62c740039722769588b1c464231e5ce1` plus approved D-009/D-010:A and the current T12 implementation working tree
- Evidence scope: `docs/project-knowledge-base.md`, `docs/decision-queue.md`, `docs/research/`, `README.md`, `shuttle-tracking-web/app/`, `shuttle-tracking-web/components/`, `shuttle-tracking-web/services/`, `shuttle-tracking-web/contexts/`, `shuttle-tracking-web/hooks/`, `shuttle-tracking-web/utils/`, `shuttle-tracking-web/tests/`, `shuttle-tracking-web/package.json`, `shuttle-tracking-web/simulate.js`, `shuttle-tracking-web/simulate-manual.js`, `shuttle-tracking-backend/src/routes/`, `shuttle-tracking-backend/src/controllers/`, `shuttle-tracking-backend/src/services/`, `shuttle-tracking-backend/prisma/`, and `shuttle-tracking-backend/tests/`
- Reviewed at: `2026-08-01T14:45:45+07:00`
- Validation state: `Validated`
- Predecessor baselines: `docs/project-knowledge-base.md @ 6697acbd62c740039722769588b1c464231e5ce1` plus its T12 implementation re-audit addendum

## 1. Executive Summary

The owner has selected D-001=C, a wider public rider release. This changes the product contract: the
existing public tracker and feedback capture cannot be represented as an eligible public service until
route-stop operations, supported sender/trip accountability, actionable exceptions, accountable feedback
triage, and truthful public service states are delivered. D-005=B also makes the 10-minute backend
receipt-time auto-close and its exception/recovery path a required operational outcome, not an optional
enhancement. D-007 defines `DEV` > `SUPER_ADMIN` > `ADMIN`, but the user/account lifecycle and privileged
action controls required to implement that hierarchy remain owner-controlled gaps.

Repository evidence now shows a public map, route/stop/vehicle CRUD, authenticated route-stop
composition, authenticated technical sender contracts, simulators, raw-research APIs, and feedback
submission. It does not show a driver application, trip/history or exception UI, public service-state
explanation, or Dev Dashboard. T12 now adds the bounded feedback inbox, privacy notice, and safe
read-only source-health view; it is not a device recovery/operations implementation. The
T8 public-map correction is retained as
**Resolved for its limited truthful-local-state scope**; it does not supply the C-scope operational state
model.

## 2. Scope and Freshness

This audit revalidates product roles, journeys, release promises, ownership, and roadmap impact. It does
not establish deployment, provider, physical-device, browser-runtime, or field-performance behavior.

The prior Product report was based at `671b712...`. T10 now supplies the previously missing route-stop
operator journey and D-009 supplies T12's product/privacy policy. T10's backend/frontend source and
deterministic tests prove its bounded implementation, not a deployed rider/admin workflow; D-009 does
not yet create an inbox, notice, retention execution, or role enforcement. No browser session, real
rider/operator, native Android sender, ESP32 firmware, TTN deployment, or physical source was observed.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence |
|---|---|---|
| Route-stop management UI is missing | **Resolved** | The authenticated Routes page opens `RouteStopsModal`, which loads active/current stops and publishes the ordered list through the bounded replacement API. Deterministic backend and repository-CI evidence passed; no ambient browser/database workflow was run. |
| A supported driver/mobile workflow is missing | **Partially Resolved** | Sender/trip/HTTP/Socket.IO contracts and simulators exist. D-007/D-005 now constrain the separate Android workflow, but no application or its acceptance evidence is in this repository. |
| Admin trip history is missing | **Still Present** | No protected list/detail controller, route, page, or exception surface is present. |
| Feedback workflow lacks triage | **Partially Resolved** | T12 implements the approved notice, receipt, Super Admin/Dev inbox, assignment/status flow, delete/restore, and source/test retention contract. No staff/rider acceptance, migration, or retention-run evidence exists. |
| Stale/offline operational visibility is missing | **Partially Resolved** | T8 keeps public Marker/live-count/ETA projection internally coherent after local expiry and route change. Public/admin UI still lacks an accountable fresh/stale/no-service/recovery explanation or an operations exception view. |
| Device operations are incomplete | **Still Present** | Backend device CRUD/credential rotation and selection analytics exist; no operator-visible source/device or claim/recovery surface exists. |
| Hard-coded public route choice | **No Longer Relevant** | The tracker loads active routes from the public API. Route authority and cache invalidation remain a separate T10 concern. |
| Controlled-demo scope was the release boundary | **No Longer Relevant** | D-001=C supersedes it; the required C-scope capabilities remain unimplemented and block a wider public-service claim. |
| Raw research diagnostics were absent | **Resolved** | T7 provides bounded, protected diagnostics/metrics/export APIs for its approved research scope; it does not create a researcher dashboard or field evidence. |

## 4. Journey and Role Assessment

| Journey | State | Evidence-based assessment |
|---|---|---|
| Rider: choose route, inspect stops/vehicles, use ETA | Partial | Public REST, canonical Socket.IO projection, map, stops, and ETA components exist. T8 prevents locally expired non-live vehicles from remaining visible, but riders do not receive a service-state/recovery explanation. |
| Rider: submit feedback | Partial | `FeedbackModal` has validation/loading/success/error plus the approved anonymous/no-reply/privacy/business-day notice. T12 adds the staff inbox, but no human acceptance or actual retention evidence exists. |
| ADMIN: maintain routes/stops/vehicles | Partial | CRUD pages and an authenticated route-stop composition/reorder/publish journey exist. The expected public-cache transition has source/test evidence but no ambient browser/database workflow evidence. |
| ADMIN: monitor/send/recover service | Missing | There is no device/source, active-trip, history, timeout exception, Mobile claim/revocation, or force-close user journey. |
| Driver: select vehicle, start, send, reconnect, end | Missing | D-007/T11 define a native, internally installed application using an enrolled shared phone and non-secret vehicle QR. The repository contains only backend technical contracts/simulators, not that supported product. |
| SUPER_ADMIN/DEV: privileged data/research operation | Missing | D-007 approves authority intent, while provision/promotion/deletion/re-authentication/audit/restore controls are still not approved or implemented. T7 research APIs are not a dashboard or account-lifecycle surface. |
| Researcher: compare three physical sources | Partially Resolved | T7's protected research APIs and D-004 definitions exist. The Dev Dashboard, ESP32/TTN/mobile field evidence, and metric outcome evidence remain unavailable. |

## 5. Product Requirements and Ownership Gaps

| Required C-scope capability | Outcome/acceptance signal | Owner/policy state |
|---|---|---|
| Route-stop operations (T10) | Admin publishes valid ordered stops; next public read can obtain revised route data. | **Resolved for exact T10 handoff scope**; public cache invalidation is source/test-verified, while ambient runtime/browser evidence is unavailable. |
| Sender, timeout, history, exceptions (T11) | Supported Android/IoT operating paths, protected history, clear timeout/admin recovery. | Mobile/timeout policy is approved; account lifecycle, technical concurrency/restart details, external Android acceptance, and fresh evidence remain gates. |
| Feedback triage and device operations (T12) | Each feedback item has accountable handling; authorized staff can see source/device status. | D-009 approves owner, anonymous/no-reply scope, business-day status lifecycle, retention/deletion/restore, and read-only safe fields. Server enforcement and the actual journey remain required. |
| Public service-state communication | Riders distinguish fresh service, no service, stale/disconnected data, and recovery. | Required by D-001=C; precise public wording/operations ownership must be incorporated by the affected work. |

## 6. Roadmap Impact

- T9 remains **Blocked**: D-008 does not name provider, topology, TLS, secrets, backup/restore,
  migration/rollback, logging, or incident owner.
- T10 is complete for its exact handoff scope; changed evidence is now carried by this re-audit.
- T11 remains gated by its downstream fresh audits, the unapproved general role/account-lifecycle
  controls where its implementation touches them, technical lifecycle parameters, and external Android
  acceptance evidence. Do not treat its policy brief as Android implementation evidence.
- T12 is complete for its D-009/D-010:A exact source/test scope. Its migration, retention, and
  staff/rider acceptance still require an approved runtime target before release evidence exists.
- Roadmap synthesis must preserve these separate gates; D-001=C alone does not authorize any task.

## 7. Assumptions, Unknowns, and Confidence

The audit treats Mobile/Socket.IO, ESP32+GPS/Wi-Fi/HTTP, and LoRaWAN/Gateway/TTN/Webhook as separate
research/operational boundaries; simulators are only test tools. Static source evidence gives **High**
confidence for the missing product surfaces and approved policies, **Medium** confidence for local T8
projection behavior because focused deterministic tests exist, and **Low** confidence for user,
operator, mobile, hardware, provider, privacy, or production outcomes without runtime evidence.

## 8. Proposed Owner Decisions

The following remain pending and are not inferred by this audit: general `ADMIN`/`SUPER_ADMIN`
provisioning and credential lifecycle, the reusable server role/re-authentication implementation,
backup/rollback behavior, and external Android acceptance evidence. D-009 resolves T12's policy
choices but not their code, migration, or runtime proof.

## 9. Handoff

Architecture is now the next eligible audit profile. It must consume this Product baseline and revalidate
where C-scope operations, role boundaries, route invalidation, Mobile lifecycle, protected history, and
research isolation belong before Backend, Frontend, and Database are re-audited.

## 10. T12 Implementation Re-audit — 2026-08-01

**Finding: accountable anonymous feedback was absent — Partially Resolved.** The public form now
discloses anonymous, one-way, business-day, non-emergency handling and the approved 180-day message/
case and 30-day IP windows. `SUPER_ADMIN` (with `DEV` inheritance) receives a triage inbox with the
approved case transitions, bounded internal note, deletion reason selection, re-authentication prompt,
and 30-day restore view. This is source/build/CI evidence only; no rider or staff acceptance session,
actual business-day operation, legal review, or database retention run was observed.

**Finding: ordinary staff lacked safe source visibility — Resolved for the T12 UI scope.** `ADMIN` and
higher receive a clearly read-only source-health page showing only source type, assigned vehicle,
freshness, last-seen, status, and allowlisted error category. Sender recovery, credentials, source
assignment, raw data, and research remain absent from the page. T11 still owns shared-phone recovery.

T11 and T9 remain independent release blockers. No new owner decision is proposed.
