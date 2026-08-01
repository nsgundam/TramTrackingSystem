# Lead Audit Summary

Last updated: 2026-08-01

Coordination status: **Roadmap validated; T10 exact-path handoff is next eligible work.** On 2026-08-01 the owner changed
D-001 from A to C, changed D-005 from A to B with a 10-minute grace period, approved the base D-007 role direction, narrowed D-008 hosting candidates/domain
sequencing, and requested a public-theme Dashboard redesign. The previously validated T8 evidence
remains recorded, but those new inputs change product, security, topology, UX, production-readiness,
and roadmap assumptions. Repository CI and Compose evidence are not deployment, provider, or
physical-device proof.

## Current coordination update — 2026-08-01

This update supersedes the historical baseline statements below. T7 is complete only for its
D-006-approved disposable scope: it adds bounded raw diagnostics and protected research reads without
changing the T6 canonical or public-state boundary. T8 now makes local expiry update public
Marker/live-count/ETA together and removes non-live vehicle Markers without removing route or stop
layers. The corrective guard now also requires a current canonical `live` state, known authoritative
route match, and no local expiry before route selection can restore a Marker; the earlier recurrence
finding is resolved by source inspection. Native and isolated Playwright tests now validate local
expiry, route switching, and newer-live restoration, so T8 is **Complete for its approved truthful
public-state scope**. The controlled demo remains Conditional Go; research field trials, daily
operations, and public service remain No-Go. Final route-mutation cache invalidation remains dependent
on T10. D-001=C now opens T10–T12's product-scope gate but does not satisfy their remaining policy,
role, topology, operator-workflow, re-audit, or exact-task-handoff gates.

Product, Architecture, Backend, Frontend, Database, and Infrastructure & Device were revalidated at
`671b712...`. Dashboard & UX, Security, DevOps & Observability, Production Readiness, and Roadmap are validated.
T10 is the only T9–T12 task eligible to enter an exact-path Level 3 handoff: T9 remains topology-blocked,
T11 needs technical/external Android evidence, T12 needs owner policy, and SEC-01 remains separate corrective maintenance.

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

- Discovery: **Complete / Validated** at `671b712...`; it now includes T8 public-state inventory evidence.
- Product: **Complete / Validated** at `671b712...`; C-scope capability and unresolved owner-policy gates are recorded.
- Architecture: **Complete / Validated** at `671b712...`; it assigns C-scope boundaries without inferring unresolved policy or deployment facts.
- Backend: **Complete / Validated** at `671b712...`; T10/T11/T12 server boundaries and their remaining policy/evidence gates are recorded.
- Frontend: **Complete / Validated** at `671b712...`; T8 remains resolved and C-scope UI/task gates are recorded without absorbing the later T14 redesign scope.
- Database: **Complete / Validated** at `671b712...`; it preserves T5/T7 boundaries and records the exact missing T10/T11/T12 data gates.
- Infrastructure & Device: **Complete / Validated** at `671b712...`; D-008 exact deployment/operations and all physical/provider facts remain unavailable.
- Dashboard & UX: **Complete / Validated** at `671b712...`; public/operations/research boundaries and the later T14 design-hierarchy gate are recorded.
- Security, DevOps & Observability: **Complete / Validated** at `671b712...`; D-007/D-008/T12 controls remain gated and new SEC-01 sensitive Socket.IO payload logging blocks production readiness.
- Production Readiness: **Complete / Validated** at `671b712...`; No-Go for D-001=C and production stages, with SEC-01 and the remaining policy/topology/operations/device gates carried forward.
- Roadmap: **Complete / Validated** at `671b712...`; T10 may proceed only after exact-path handoff and all other T9–T12 gates remain explicit.

## 3. Evidence and validation

The corrective re-audits compared changed evidence from
`4d5a456a6d73ef5a58d674426ba889f43102a9d2` to `9b7ff7325169a8bfa67d29ced94588edd3dbf28a`.
`bash scripts/ci-checks.sh` passed: backend build/boundary tests, Prisma validation, frontend
lint/build, development/production Compose parsing, dynamic-log check, and workflow validation.
Frontend lint retains two pre-existing warnings in `app/layout.tsx` and `utils/IconHelpers.ts`.
Source inspection plus native and isolated Playwright evidence verifies the live-count repair and the
route-switch Marker guard.
No focused timer/route-switch fixture, browser, Socket.IO interruption, deployment, provider,
hardware, or ambient stateful check was run.

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
for exact topology, TLS, data placement, and operational owners. The next eligible work is the T10
exact-path Level 3 handoff; the Level 1 freshness gate has been passed, while T9, T11, and T12 retain
their independent blockers.

Confidence is **High** for the recorded owner directions and repository-visible T8 state path,
**Medium** for the provisional T9–T15 gate mapping, and **Low** for deployment, provider,
physical-device, destructive-data operations, and real-world operator outcomes until re-audited.
