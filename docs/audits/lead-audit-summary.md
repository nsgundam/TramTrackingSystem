# Lead Audit Summary

Last updated: 2026-08-07

Coordination status: **D-008 policy approved and affected audits revalidated; production remains
No-Go.** The university single-host/single-origin handoff and responsibility boundary are fixed. T9
is eligible for an exact repository-side handoff, T11 remains blocked on its external Android
acceptance artifact and exact lifecycle handoff, and D-011/D-012 record the remaining T14/general
lifecycle owner gates.
Repository CI and Compose evidence are not deployment, provider, credential-rotation, UX-acceptance,
or physical-device proof.

## Current coordination update — 2026-08-07

This update supersedes prior active coordination statements while retaining the historical snapshots
below. The immutable source baseline is
`82f4d97d8609d73f79aa74eea6efaadaa34238d9`.

- D-008 selects a university-managed single host behind one TLS origin at the preferred
  `tram-tracking.rsu.ac.th`, with private data services and a formal application-versus-Server/
  Network responsibility boundary. Vercel/Render/Neon and AWS learning remain isolated demos.
- The decision enables T9 repository work but supplies no actual host, TLS, firewall, secret,
  backup, alert, contact, recovery, capacity, or deployment evidence.

- M-20260807-01 removes raw invalid Socket.IO payload logging while preserving the stable rejection
  response and allowlisted outcome signal; focused and CI regression guards cover `rawData`.
- M-20260807-02/03 remove the automated simulator's non-local/default-credential behavior, redact
  raw/token/coordinate output from both Mobile simulators, restore a deterministic one-shot path, and
  exclude Playwright artifacts from Git and Docker context.
- Discovery through Production Readiness and Roadmap were revalidated for D-008. The required
  Impeccable Dashboard & UX audit remains **9/20 (Poor)** with
  no P0 and open truthful-state, modal/focus/form, Feedback-association, mobile-navigation,
  responsive, and maintainability findings.
- The supported monolith remains appropriate. No UI implementation, microservice split, database
  migration, retention run, simulator target, deployment, provider, credential rotation, hardware,
  field test, or human browser acceptance was performed.

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

- Discovery: **Complete / Validated** at 82f4d97; D-008 policy is recorded without inventing runtime facts.
- Product: **Complete / Validated**; T10/T12 exact journeys are implemented, without human acceptance evidence.
- Architecture: **Complete / Validated**; persisted RBAC/fresh-auth and Feedback/safe-DTO boundaries are current.
- Backend: **Complete / Validated**; T12 server models, role enforcement, deterministic tests, and CI are current.
- Frontend: **Complete / Validated**; public notice, inbox, and read-only health UI build, but no ambient browser role workflow ran.
- Database: **Complete / Validated**; T12's reviewed additive migration/lifecycle/audit/retention design is current but unexecuted.
- Infrastructure & Device: **Complete / Validated**; D-008 logical topology/owners are approved, while actual deployment and all physical/provider evidence remain unavailable.
- Dashboard & UX: **Complete / Validated**; required technical audit is 9/20 (Poor), with no P0 and unresolved T14 P1/P2 scope.
- Security, DevOps & Observability: **Complete / Validated**; D-008 policy is resolved while T9 source gaps, external credential rotation, broad scanning, and durable runtime operations remain open.
- Production Readiness: **Complete / Validated / No-Go**; T9/external Server acceptance, T11, T12 runtime, 9/20 UX, operations, credentials, devices/providers, and field evidence remain blockers.
- Roadmap: **Complete / Validated**; T9 is eligible for an exact repository handoff, T11 remains blocked, and D-011/D-012 retain T14/general lifecycle owner gates.

## 3. Evidence and validation

`bash scripts/ci-checks.sh` passed after the final M-20260807-03 source changes: backend build and
boundary tests, Prisma validation, simulator tooling tests (4/4), T8 state tests and isolated
Playwright coverage, frontend lint/build, development/production Compose parsing, dynamic-log guard,
and workflow validation. An earlier run exposed a transient pre-existing T8 expiry timing failure;
the immediate full rerun and the later final full run passed. Frontend lint retains two pre-existing
warnings in `app/layout.tsx` and `utils/IconHelpers.ts`.

No database migration, retention purge, role/feedback browser acceptance, authenticated invalid-
payload runtime journey, simulator target, Socket.IO interruption, deployment, provider, credential
rotation, hardware, field, or ambient stateful check was run.

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
policy is complete; exact implementation parameters/handoff and external Android acceptance evidence
remain required.
D-008 is approved through the binding specialist brief: university-managed single-host production,
one TLS origin, private data services, application-team artifact/migration/runbook ownership, and
University Server/Network infrastructure/recovery/operations ownership. Its external acceptance
checklist remains unverified. The next eligible work is an exact T9 repository handoff; T9 cannot be
completed from static tests alone. T11 remains blocked on the external Android artifact/exact
lifecycle handoff, T13 depends on T9 and approved operations evidence, T14 awaits owner priority/
exact handoff, and T15 awaits physical facts and T13. A later approved target may supply T12 runtime
evidence but does not bypass these gates or grant deployment scope.

Confidence is **High** for the recorded owner directions and repository-visible source/test evidence,
**Medium** for the provisional T9–T15 gate mapping, and **Low** for deployment, provider, credential
rotation, human UX outcomes, physical-device, destructive-data operations, and real-world operator
outcomes until external evidence exists.
