# Lead Audit Summary

Last updated: 2026-08-09

Coordination status: **T14's truth, accessibility/navigation, measured Public map-quality, and
contrast/color-governance slices and every affected audit are revalidated; a bounded Admin shell/
Dashboard hierarchy and theme foundation is the next eligible lane; production remains No-Go.** Product,
Architecture, Frontend, Dashboard & UX, Production Readiness, and Roadmap are current at
`f42a2bb...`; unaffected Level 1 records remain current at `1eec866...`.
The owner defers T9 continuation and T13 without satisfying their external gates. T11 now has pinned
native Mobile source but remains blocked on coordinated implementation, writable Mobile/Android
acceptance authority, and a device report. D-012 is approved but unimplemented. T15 remains deferred
behind T13 and physical/provider facts. Repository/static Mobile evidence is not deployment, provider,
credential-rotation, UX-acceptance, or physical-device proof.

## Current coordination update — 2026-08-09

This update supersedes prior active coordination statements while retaining the historical snapshots
below. The immutable source baseline is
`f42a2bb025c4756e04542fc9dbecb41009d8ce7a`; the unrelated dirty Feedback-role migration is
preserved and excluded.

- D-011 approves data integrity/truthful Public/Admin state as T14's first slice, preserves Public
  visual identity, and allows later separately bounded Admin redesign. D-012 approves the
  least-privilege lifecycle matrix but adds no current account/Sender/deletion/recovery control.
- Discovery pins Android repository `0-Mini-Peak-1/RSUBusTrackerApp` at
  `949c80369d1d133b6c03282fedaa2f475a73114b`. Native foreground/Socket.IO/Trip code is partial
  evidence; reusable credential storage, backup/cleartext, task-removal, enrollment/claim/recovery,
  tests, signing, and device/OS gaps remain.
- Product/Architecture/Backend/Database confirm the safe route is one coordinated versioned
  Backend/Admin/Mobile state machine; the current static-secret client must not become a second
  permanent authority.
- Infrastructure & Device records the build as Unable to Verify without Android SDK and retains all
  ESP32/LoRaWAN/provider/field unknowns. Security records SEC-08 High for external Mobile credential,
  backup, cleartext, and lifecycle gaps.
- T14's first four handoffs are complete: fail-closed/truth projections; root zoom/language and
  scoped dialog/form/focus/navigation; selected-route request budgets; owned/reduced marker and map
  motion; a non-colliding 320 px Public layout; audited 44 px targets; and scoped light-surface/route-
  badge contrast pass focused browser/unit and full-CI evidence. Public identity remains intact. The
  Dashboard & UX score is 14/20; two P1, eight P2, and one P3 remain open.
- Production Readiness remains No-Go. T9/T13 are deferred by owner, not completed; T11/T12 runtime,
  SEC-08, UX, operations, device/provider and field gates remain.
- Roadmap revalidation selects a bounded Admin shell/Dashboard hierarchy and complementary-theme
  foundation next without bypassing T9/T11/T13/T15 or inventing unavailable exception/research data.

The controlled local demo remains Conditional only; research field trials, daily operations, and
public service remain No-Go.

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

- Discovery: **Complete / Validated** at `1eec866...`; owner decisions and pinned external Mobile facts are current.
- Product: **Complete / Validated** at `f42a2bb...`; four T14 journeys are revalidated and Mobile remains partial.
- Architecture: **Complete / Validated** at `f42a2bb...`; canonical, focus, motion, selected-route loading, and display-color boundaries are current.
- Backend: **Complete / Validated** at `1eec866...`; current sender contract and missing T11 lifecycle are revalidated.
- Frontend: **Complete / Validated** at `f42a2bb...`; four T14 slices are verified, Public identity is preserved, and the source score is 14/20.
- Database: **Complete / Validated** at `1eec866...`; D-012 target invariants are approved but absent from schema/runtime.
- Infrastructure & Device: **Complete / Validated** at `1eec866...`; native source is partial and Android runtime remains unverified.
- Dashboard & UX: **Complete / Validated** at `f42a2bb...`; seven P1 and two P2 findings are resolved and bounded Admin theme foundation is next.
- Security, DevOps & Observability: **Complete / Validated** at `1eec866...`; SEC-08 is open and D-012 controls are unimplemented.
- Production Readiness: **Complete / Validated / No-Go** at `f42a2bb...`; external/release gates remain open.
- Roadmap: **Complete / Validated** at `f42a2bb...`; bounded Admin shell/Dashboard theme foundation is next.

## 3. Evidence and validation

Current validation passed T14 contrast unit 4/4 and Playwright 2/2, motion unit 4/4, map-quality
Playwright 2/2, truth Playwright 2/2, accessibility Playwright 4/4, the T8 browser regression 1/1,
and full `bash scripts/ci-checks.sh`:
backend build/boundaries/Prisma,
frontend tests/E2E/lint/production build, development/production Compose, topology, unsafe dynamic-
log scan, and workflow validation. Frontend lint retains two existing warnings; the final scoped
Impeccable detector returned one reviewed advisory for the pre-existing tiled map fallback and no
blocking result; no required check failed. These are synthetic/local checks, not human, physical-
device, network-budget, or deployed acceptance.

No database migration, retention purge, human role/feedback or accessibility acceptance,
authenticated invalid-payload runtime journey, simulator target, deployed Socket.IO interruption,
deployment, provider, credential rotation, hardware, field, or ambient stateful check was run.

## 4. Decisions and next action

Approved D-001=C supersedes A. D-007 records hierarchical `DEV` > `SUPER_ADMIN` > `ADMIN` authority,
with `DEV` able to perform every action. T11 permits `ADMIN` or higher to provision device Sender
credentials in the Admin UI, while a separate Mobile GPS Sender Application performs the driver GPS
runtime against the Backend; only the owner/authorized creator team may provision or remove `DEV`
out of band. `SUPER_ADMIN` privileged deletion is limited to Trip, GPSTrack, and Feedback. D-012 now
fixes the least-privilege actor/action/fresh-auth/reason/audit/recovery matrix; its account/session,
non-Mobile Sender, recoverable deletion, backup/restore, and out-of-band recovery controls remain
implementation gates. For T11, `ADMIN` or higher may disable/revoke and re-enroll a
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
is `docs/audits/specialized/T11-identity-mobile-sender-enrollment.md`. V3 pins the supplied Android
source and records partial foreground/Socket.IO evidence plus the static-secret, backup/cleartext,
task-removal, enrollment/claim/recovery, build, and device-report gaps. The focused T11 owner policy
is complete; a coordinated Backend/Admin/Mobile handoff and external Android acceptance remain
required.
D-008 is approved through the binding specialist brief: university-managed single-host production,
one TLS origin, private data services, application-team artifact/migration/runbook ownership, and
University Server/Network infrastructure/recovery/operations ownership. Its external acceptance
checklist remains unverified. The repository-side T9 handoff is implemented and revalidated by every
audit profile, but T9 cannot be completed from static tests alone. The owner defers T9 continuation
and T13 without satisfying those gates. T14's first four slices are complete and revalidated while
preserving Public identity; a bounded Admin shell/Dashboard theme-foundation handoff is the next
eligible action. T11 remains blocked on coordinated Mobile/Backend implementation and Android acceptance,
and T15 awaits physical facts and T13. A later
approved target may supply T12 runtime evidence but does not bypass these gates or grant deployment
scope.

Confidence is **High** for the recorded owner directions and repository-visible source/test evidence,
**Medium** for the provisional T9–T15 gate mapping, and **Low** for deployment, provider, credential
rotation, human UX outcomes, physical-device, destructive-data operations, and real-world operator
outcomes until external evidence exists.
