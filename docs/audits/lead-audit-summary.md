# Lead Audit Summary

Last updated: 2026-08-01

Coordination status: **Roadmap revalidated; T12 is complete for its exact source/test scope.** T10 is
also complete for its exact bounded scope. T9 remains D-008 topology blocked and T11 remains blocked
on its external Android acceptance artifact and exact lifecycle handoff. Repository CI and Compose
evidence are not deployment, provider, or physical-device proof.

## Current coordination update — 2026-08-01

This update supersedes the historical baseline statements below. Discovery through Roadmap have been
re-audited at committed baseline `6697acb...` plus the current D-009/D-010 decision working copy.
T10 is **Complete for its exact handoff scope**: authenticated route-stop replacement validates active
membership, assigns contiguous order, writes transactionally, invalidates public cache, and is surfaced
in the Admin Routes page. Backend check, frontend lint/build, and repository CI passed; no ambient
database/browser/cache workflow was authorized.

D-009/D-010:A are now implemented for T12's exact scope: the reviewed migration maps legacy
`OPERATOR` to `ADMIN` and sets the future default; server middleware rechecks current allowlisted
roles and requires 15-minute fresh authentication for privileged Feedback delete/restore; the public
notice, accountable inbox, safe source-health view, lifecycle/audit/retention code, and deterministic
tests are present. `bash scripts/ci-checks.sh` passes. No database migration, retention run, or
role/feedback browser acceptance was authorized. SEC-01 remains a separate corrective maintenance
blocker.
The controlled demo remains Conditional Go; research field trials, daily operations, and public service
remain No-Go.

## Historical T6 snapshot — superseded by the current coordination update

T6 establishes a backend-owned `CanonicalVehicleStateV1` envelope with:

- Redis-backed epoch/version ordering and one canonical Socket.IO publication boundary;
- explicit `live`, `stale`, `no_service`, and `unknown` state semantics;
- server-owned route authority (`active_trip` → `vehicle_assignment` → `unknown`);
- matching REST/Socket projections with public `sourceId` omission;
- frontend initial snapshot hydration, version guards, local freshness expiry, route filtering,
  and admin connection/service-state presentation.

The Architecture re-audit revalidated the material prior findings. T6 resolved the untyped
canonical-state and route-assignment gaps, but current state remains transient in Redis; raw/event
time research evidence is not implemented; source-health coordination is process-local; route-stop
cache ownership remains incomplete; and global realtime fan-out is unmeasured. The public tracker
intentionally keeps detailed connection/source-health wording out of the public surface under D-005
and, at the time of that T6 validation, the then-current controlled-demo boundary D-001=A. D-001=C
now supersedes that release assumption without changing the already-tested T6 contract.

## 2. Current profile status

- Discovery: **Complete / Validated** at `6697acb...` plus current T12 working-tree evidence and external-evidence limits.
- Product: **Complete / Validated**; T10/T12 exact journeys are implemented, without human acceptance evidence.
- Architecture: **Complete / Validated**; persisted RBAC/fresh-auth and Feedback/safe-DTO boundaries are current.
- Backend: **Complete / Validated**; T12 server models, role enforcement, deterministic tests, and CI are current.
- Frontend: **Complete / Validated**; public notice, inbox, and read-only health UI build, but no ambient browser role workflow ran.
- Database: **Complete / Validated**; T12's reviewed additive migration/lifecycle/audit/retention design is current but unexecuted.
- Infrastructure & Device: **Complete / Validated**; D-008 and all physical/provider evidence remain unavailable.
- Dashboard & UX: **Complete / Validated**; T12 inbox/health journeys are present; dashboard/accessibility evidence remains open.
- Security, DevOps & Observability: **Complete / Validated**; D-007/D-009/D-010:A enforcement is current; SEC-01/runtime operations remain release blockers.
- Production Readiness: **Complete / Validated / No-Go**; SEC-01, D-008, T11, and field/runtime evidence remain blockers.
- Roadmap: **Complete / Validated**; T10/T12 are complete for exact scopes; T9/T11 remain blocked.

## 3. Evidence and validation

The T12 re-audit compares the committed `6697acb...` baseline plus approved D-009/D-010:A against
the current implementation working tree. `bash scripts/ci-checks.sh` passed: backend build/boundary
tests (including T12 role/fresh-auth/retention/safe-DTO coverage), Prisma validation, frontend
lint/build, development/production Compose parsing, dynamic-log check, workflow validation, and the
isolated Playwright T8 route-switch fixture. Frontend lint retains two pre-existing warnings in
`app/layout.tsx` and `utils/IconHelpers.ts`.
No T12 database migration, retention purge, role/feedback browser acceptance, Socket.IO interruption,
deployment, provider, hardware, or ambient stateful check was run.

## 4. Decisions and next action

Approved D-001=C supersedes A. D-007 records hierarchical `DEV` > `SUPER_ADMIN` > `ADMIN` authority,
with `DEV` able to perform every action. T11 permits `ADMIN` or higher to provision device Sender
credentials in the Admin UI, while a separate Mobile GPS Sender Application performs the driver GPS
runtime against the Backend; only the owner/authorized creator team may provision or remove `DEV`
out of band. `SUPER_ADMIN` privileged deletion is limited to Trip, GPSTrack, and Feedback. Remaining
non-Mobile account/credential lifecycle, re-authentication/audit, backup-before-delete, and restore
controls remain implementation gates. For T11, `ADMIN` or higher may disable/revoke and re-enroll a
lost/replaced shared phone and atomically emergency-force-close its active Trip plus release the
claim with an explicit reason and immutable audit; this lifecycle action does not delete evidence.

D-005 is superseded from A to B: an active Trip auto-closes after a separate 10-minute no-GPS grace
period, not from the 30-second stale transition, for Mobile, ESP32, and LoRaWAN alike. The owner
confirms `closeReason=gps_timeout`, `endTime=lastAcceptedAt`, `closedAt` at detection, no reopening,
and a required new Trip. Mobile profile/vehicle switching is locked until the active Trip ends. The
owner confirms `lastAcceptedAt` as Backend receipt time of the latest GPS observation accepted for
the active Trip, independent of sampled `GPSTrack`. Audit/notification, restart/idempotency,
late-packet, and concurrent recovery implementation controls remain gates. T11 is Android Native,
internally distributed, uses a shared phone enrolled once, supports QR selection among vehicles,
Mobile self-start, Admin-controlled LoRaWAN/IoT start, locked-screen sending, and offline GPS
discard. Driver-facing `SOURCE_ID` entry is removed from the direction; a non-secret vehicle QR is
the primary selector and a printed short code may provide the same authenticated-session-only
fallback, while internal source provenance remains required. The current focused identity decision
is `docs/audits/specialized/T11-identity-mobile-sender-enrollment.md`. The focused T11 owner
policy is complete; stale predecessor re-audits, exact implementation parameters/handoff, and
external Android acceptance evidence remain required.
D-008 records university infrastructure/AWS/VPS and post-server domain sequencing but remains pending
for exact topology, TLS, data placement, and operational owners. There is no further eligible task in
the user-approved T9–T12 batch: T9 remains D-008 blocked, T11 remains blocked on the external Android
artifact/exact lifecycle handoff, and T12 is complete for exact scope. A later approved disposable or
staging rollout may supply T12 runtime evidence but does not bypass T9/T11 or grant deployment scope.

Confidence is **High** for the recorded owner directions and repository-visible T8 state path,
**Medium** for the provisional T9–T15 gate mapping, and **Low** for deployment, provider,
physical-device, destructive-data operations, and real-world operator outcomes until re-audited.
