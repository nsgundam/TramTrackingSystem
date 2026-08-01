# Product Audit: Tram Tracking System

Audit metadata:
- Evidence baseline: `671b71209ad3ba3341de78f836b6ec057813280c`
- Evidence scope: `docs/project-knowledge-base.md`, `docs/decision-queue.md`, `docs/research/`, `README.md`, `shuttle-tracking-web/app/`, `shuttle-tracking-web/components/`, `shuttle-tracking-web/services/`, `shuttle-tracking-web/contexts/`, `shuttle-tracking-web/hooks/`, `shuttle-tracking-web/utils/`, `shuttle-tracking-web/tests/`, `shuttle-tracking-web/package.json`, `shuttle-tracking-web/simulate.js`, `shuttle-tracking-web/simulate-manual.js`, `shuttle-tracking-backend/src/routes/`, `shuttle-tracking-backend/src/controllers/`, `shuttle-tracking-backend/src/services/`, `shuttle-tracking-backend/prisma/`, and `shuttle-tracking-backend/tests/`
- Reviewed at: `2026-08-01T12:00:00+07:00`
- Validation state: `Validated`
- Predecessor baselines: `docs/project-knowledge-base.md @ 671b71209ad3ba3341de78f836b6ec057813280c`

## 1. Executive Summary

The owner has selected D-001=C, a wider public rider release. This changes the product contract: the
existing public tracker and feedback capture cannot be represented as an eligible public service until
route-stop operations, supported sender/trip accountability, actionable exceptions, accountable feedback
triage, and truthful public service states are delivered. D-005=B also makes the 10-minute backend
receipt-time auto-close and its exception/recovery path a required operational outcome, not an optional
enhancement. D-007 defines `DEV` > `SUPER_ADMIN` > `ADMIN`, but the user/account lifecycle and privileged
action controls required to implement that hierarchy remain owner-controlled gaps.

Repository evidence still shows a public map, route/stop/vehicle CRUD, authenticated technical sender
contracts, simulators, raw-research APIs, and feedback submission. It does not show a route-stop UI,
driver application, trip/history or exception UI, source/device operations UI, feedback inbox, privacy
notice, public no-service explanation, or Dev Dashboard. The T8 public-map correction is retained as
**Resolved for its limited truthful-local-state scope**; it does not supply the C-scope operational state
model.

## 2. Scope and Freshness

This audit revalidates product roles, journeys, release promises, ownership, and roadmap impact. It does
not establish deployment, provider, physical-device, browser-runtime, or field-performance behavior.

The prior Product report was based at `d94abb3...`. The evidence diff through `671b712...` changes the
public tracker state handling and its deterministic/isolated-browser tests, and adds approved D-001=C,
D-005=B, D-007, D-008, and the binding T11 mobile-enrollment constraints. Those changes affect release
scope, journey ownership, and implementation gates, so the former controlled-demo conclusion is stale.
No browser session, real rider/operator, native Android sender, ESP32 firmware, TTN deployment, or
physical source was observed.

## 3. Prior-Finding Revalidation

| Prior material finding | State | Current evidence |
|---|---|---|
| Route-stop management UI is missing | **Still Present** | The API only lists, creates, and deletes route stops; `app/admin/` and `Sidebar.tsx` expose no composition or ordered-reorder journey. |
| A supported driver/mobile workflow is missing | **Partially Resolved** | Sender/trip/HTTP/Socket.IO contracts and simulators exist. D-007/D-005 now constrain the separate Android workflow, but no application or its acceptance evidence is in this repository. |
| Admin trip history is missing | **Still Present** | No protected list/detail controller, route, page, or exception surface is present. |
| Feedback workflow lacks triage | **Still Present** | Public capture validates and stores feedback, but there is no inbox, assignment, status, resolution, receipt, privacy notice, or deletion-control journey. |
| Stale/offline operational visibility is missing | **Partially Resolved** | T8 keeps public Marker/live-count/ETA projection internally coherent after local expiry and route change. Public/admin UI still lacks an accountable fresh/stale/no-service/recovery explanation or an operations exception view. |
| Device operations are incomplete | **Still Present** | Backend device CRUD/credential rotation and selection analytics exist; no operator-visible source/device or claim/recovery surface exists. |
| Hard-coded public route choice | **No Longer Relevant** | The tracker loads active routes from the public API. Route authority and cache invalidation remain a separate T10 concern. |
| Controlled-demo scope was the release boundary | **No Longer Relevant** | D-001=C supersedes it; the required C-scope capabilities remain unimplemented and block a wider public-service claim. |
| Raw research diagnostics were absent | **Resolved** | T7 provides bounded, protected diagnostics/metrics/export APIs for its approved research scope; it does not create a researcher dashboard or field evidence. |

## 4. Journey and Role Assessment

| Journey | State | Evidence-based assessment |
|---|---|---|
| Rider: choose route, inspect stops/vehicles, use ETA | Partial | Public REST, canonical Socket.IO projection, map, stops, and ETA components exist. T8 prevents locally expired non-live vehicles from remaining visible, but riders do not receive a service-state/recovery explanation. |
| Rider: submit feedback | Partial | `FeedbackModal` has validation/loading/success/error feedback and posts through a rate-limited public route. IP capture, notice, access, retention, triage, and response ownership are not defined. |
| ADMIN: maintain routes/stops/vehicles | Partial | CRUD pages exist. Route-stop sequencing/publishing is unavailable in the UI and the existing API cannot reorder atomically. |
| ADMIN: monitor/send/recover service | Missing | There is no device/source, active-trip, history, timeout exception, Mobile claim/revocation, or force-close user journey. |
| Driver: select vehicle, start, send, reconnect, end | Missing | D-007/T11 define a native, internally installed application using an enrolled shared phone and non-secret vehicle QR. The repository contains only backend technical contracts/simulators, not that supported product. |
| SUPER_ADMIN/DEV: privileged data/research operation | Missing | D-007 approves authority intent, while provision/promotion/deletion/re-authentication/audit/restore controls are still not approved or implemented. T7 research APIs are not a dashboard or account-lifecycle surface. |
| Researcher: compare three physical sources | Partially Resolved | T7's protected research APIs and D-004 definitions exist. The Dev Dashboard, ESP32/TTN/mobile field evidence, and metric outcome evidence remain unavailable. |

## 5. Product Requirements and Ownership Gaps

| Required C-scope capability | Outcome/acceptance signal | Owner/policy state |
|---|---|---|
| Route-stop operations (T10) | Admin publishes valid ordered stops; next public read shows revised route data. | Product scope approved; affected audits and task handoff required. |
| Sender, timeout, history, exceptions (T11) | Supported Android/IoT operating paths, protected history, clear timeout/admin recovery. | Mobile/timeout policy is approved; account lifecycle, technical concurrency/restart details, external Android acceptance, and fresh evidence remain gates. |
| Feedback triage and device operations (T12) | Each feedback item has accountable handling; authorized staff can see source/device status. | Feedback owner, privacy/notice, retention/deletion, escalation/SLA, privileged deletion controls, and device action matrix are pending owner decisions. |
| Public service-state communication | Riders distinguish fresh service, no service, stale/disconnected data, and recovery. | Required by D-001=C; precise public wording/operations ownership must be incorporated by the affected work. |

## 6. Roadmap Impact

- T9 remains **Blocked**: D-008 does not name provider, topology, TLS, secrets, backup/restore,
  migration/rollback, logging, or incident owner.
- T10 may become eligible after the remaining dependent audit profiles are validated and a narrow
  exact-path task handoff passes review. It must add ordered composition/invalidation rather than merely
  exposing the existing create/delete API.
- T11 remains gated by its downstream fresh audits, the unapproved general role/account-lifecycle
  controls where its implementation touches them, technical lifecycle parameters, and external Android
  acceptance evidence. Do not treat its policy brief as Android implementation evidence.
- T12 remains **Blocked** on explicit feedback/support/privacy/deletion/device-operation policies.
- Roadmap synthesis must preserve these separate gates; D-001=C alone does not authorize any task.

## 7. Assumptions, Unknowns, and Confidence

The audit treats Mobile/Socket.IO, ESP32+GPS/Wi-Fi/HTTP, and LoRaWAN/Gateway/TTN/Webhook as separate
research/operational boundaries; simulators are only test tools. Static source evidence gives **High**
confidence for the missing product surfaces and approved policies, **Medium** confidence for local T8
projection behavior because focused deterministic tests exist, and **Low** confidence for user,
operator, mobile, hardware, provider, privacy, or production outcomes without runtime evidence.

## 8. Proposed Owner Decisions

The following remain pending and are not inferred by this audit: feedback/support owner; rider privacy
notice and IP/feedback retention/access/deletion timing; escalation/SLA; deletion re-authentication,
audit, backup/restore controls; general `ADMIN`/`SUPER_ADMIN` provisioning and credential lifecycle;
and the device/source action matrix. These decisions are binding gates for T12 and any related role
implementation.

## 9. Handoff

Architecture is now the next eligible audit profile. It must consume this Product baseline and revalidate
where C-scope operations, role boundaries, route invalidation, Mobile lifecycle, protected history, and
research isolation belong before Backend, Frontend, and Database are re-audited.
