# Lead Audit Summary

Last updated: 2026-08-07

Coordination status: **Every audit and the Roadmap are revalidated, no Roadmap implementation unit is
currently eligible, and production remains No-Go.** All Level 1 records are current at `cdedcc2...`.
T9 is still only partially complete because University Server/Network acceptance is external. T11
remains blocked on its Android artifact/exact lifecycle handoff, T13 is blocked behind T9 and target
authority, T14 is blocked on D-011, and T15 is deferred behind T13 and physical/provider facts.
D-012 retains the later general lifecycle owner gate.
Repository CI and Compose evidence are not deployment, provider, credential-rotation, UX-acceptance,
or physical-device proof.

## Current coordination update — 2026-08-07

This update supersedes prior active coordination statements while retaining the historical snapshots
below. The immutable source baseline is
`cdedcc2fd82ab264e2176716ac23a74c948e1a28`.

- T9 implements the checked-in university single-host/single-origin template: private data network,
  authenticated Redis, loopback-only app ports, versioned images, health ordering, one fail-closed
  backend runtime authority, one frontend REST/Socket origin authority, and the external-team
  operations runbook.
- Focused Discovery evidence passed at `cdedcc2...`: backend `npm run check`, frontend T9 tests
  (5/5), and the static production-topology test. No stateful or external target was operated.
- Discovery revalidates every material prior finding and the current role, Feedback, research,
  route-stop, source-health, startup, and topology inventory. It explicitly preserves physical
  Mobile/ESP32/LoRaWAN/provider facts and production host/proxy/DNS/TLS/secrets/restore/alerts/
  capacity as unavailable external evidence.
- Product confirms that T9 preserves existing rider/admin journey semantics while removing REST/
  Socket fallback ambiguity; no deployed or human journey evidence was created.
- Architecture confirms that T9 preserves the monolith, durable/transient data-product authority,
  and ingestion/canonical boundaries while resolving the repository topology/origin authority.
- Infrastructure & Device confirms T9's static handoff while retaining all external/device facts.
  Dashboard & UX confirms T9 changed no UI semantics and the current Impeccable score remains 9/20
  (Poor), with no P0; D-011 is still the T14 scope-order gate.
- Security/DevOps/Observability closes T9's checked-in port/origin/auth/proxy/health findings while
  retaining TLS, secrets, firewall, restore, alerts, forwarded-hop, and incident evidence as external.
- Production Readiness remains No-Go after current full CI: external T9 acceptance, T11 Android/
  lifecycle, T12 runtime, 9/20 UX, operations, devices/providers, and field evidence remain open.
- Roadmap revalidation confirms that T9 continuation requires external target/operator authority,
  T11 lacks its exact lifecycle handoff and Android artifact, T13 depends on external T9 acceptance,
  T14 cannot consume pending D-011, and T15 remains deferred. The approved batch therefore stops
  without selecting an unauthorized implementation task.

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

- Discovery: **Complete / Validated** at `cdedcc2...`; T9 repository facts and external limits are current.
- Product: **Complete / Validated** at `cdedcc2...`; T9 preserves existing journeys and remains externally unaccepted.
- Architecture: **Complete / Validated** at `cdedcc2...`; the monolith and data authorities remain appropriate.
- Backend: **Complete / Validated** at `cdedcc2...`; T9 runtime/proxy/CORS/data-client boundaries are current.
- Frontend: **Complete / Validated** at `cdedcc2...`; T9 origin authority and full frontend checks are current, while technical UX remains 9/20 (Poor).
- Database: **Complete / Validated** at `cdedcc2...`; no schema/migration changed and private/authenticated data boundaries are current.
- Infrastructure & Device: **Complete / Validated** at `cdedcc2...`; repository topology is current and all external/device facts remain unavailable.
- Dashboard & UX: **Complete / Validated** at `cdedcc2...`; T9 changed no UI semantics and Impeccable remains 9/20 (Poor).
- Security, DevOps & Observability: **Complete / Validated** at `cdedcc2...`; repository T9 controls are current and external security/operations facts remain unavailable.
- Production Readiness: **Complete / Validated / No-Go** at `cdedcc2...`; current full CI passes and external/release gates remain open.
- Roadmap: **Complete / Validated** at `cdedcc2...`; no implementation unit is currently eligible.

## 3. Evidence and validation

Current validation passed full `bash scripts/ci-checks.sh`: backend build and boundary suites
(including T6/T9/T10/T12), Prisma validation, simulator and focused frontend suites, isolated
Playwright, frontend lint/build, development/production Compose validation, the T9 topology test,
unsafe dynamic-logging scan, and workflow validation. Frontend lint retains two existing warnings;
no check failed. Focused Discovery evidence also passed backend `npm run check`, frontend
`npm run test:t9` (5/5), and `node scripts/test-production-topology.mjs`.

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
checklist remains unverified. The repository-side T9 handoff is implemented and revalidated by every
audit profile, but T9 cannot be completed from static tests alone. Roadmap revalidation is now
complete. T11 remains blocked on the external Android artifact/exact lifecycle handoff, T13 depends
on T9 external acceptance and approved operations evidence, T14 awaits D-011 and an exact handoff,
and T15 awaits physical facts and T13. No next Roadmap implementation unit is eligible. A later
approved target may supply T12 runtime evidence but does not bypass these gates or grant deployment
scope.

Confidence is **High** for the recorded owner directions and repository-visible source/test evidence,
**Medium** for the provisional T9–T15 gate mapping, and **Low** for deployment, provider, credential
rotation, human UX outcomes, physical-device, destructive-data operations, and real-world operator
outcomes until external evidence exists.
