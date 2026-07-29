# Lead Audit Summary

Last updated: 2026-07-29

Coordination status: **All domain profiles, Production Readiness, and Roadmap are validated**.
Frontend, Dashboard & UX, Production Readiness, and Roadmap were re-audited at
`4d5a456a6d73ef5a58d674426ba889f43102a9d2`; unaffected domain evidence remains at `d94abb3...`.
Repository CI and Compose evidence are not treated as deployment, provider, or physical-device proof.

## Current coordination update — 2026-07-29

This update supersedes the historical baseline statements below. T7 is complete only for its
D-006-approved disposable scope: it adds bounded raw diagnostics and protected research reads without
changing the T6 canonical or public-state boundary. T8 now makes local expiry update public
Marker/live-count/ETA together and removes non-live vehicle Markers without removing route or stop
layers. Its re-audits also found that route selection can restore a stale/expired stored Marker before
a newer canonical `live` state, so T8 remains **Partially Complete**. The controlled demo remains
Conditional Go; research field trials, daily operations, and public service remain No-Go. Final
route-mutation cache invalidation remains dependent on T10 and D-001=B/C.

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
and the controlled-demo boundary D-001=A.

## 2. Current profile status

- Discovery: **Complete / Validated** at `d94abb3...`.
- Product: **Complete / Validated** at `d94abb3...`; D-001=A remains the controlled-demo scope.
- Architecture: **Complete / Validated** at `d94abb3...`; the T6 canonical authority boundary remains current.
- Backend: **Complete / Validated** at `d94abb3...`; no backend/API trust boundary changed for T8.
- Frontend: **Complete / Validated** at `4d5a456...`; local-expiry Marker/count/ETA projection is repaired, but route switching can restore a stale/expired Marker before newer canonical `live`.
- Database: **Complete / Validated** at `d94abb3...`; T8 changes no schema, lifecycle, or retention evidence.
- Infrastructure & Device: **Complete / Validated** at `d94abb3...`; T8 changes no deployment, provider, or hardware evidence.
- Dashboard & UX: **Complete / Validated** at `4d5a456...`; public remains canonical-only/neutral, with the same route-switch truthfulness finding.
- Security, DevOps & Observability: **Complete / Validated** at `d94abb3...`; no auth, export, logging, or topology control changed.
- Production Readiness: **Complete / Validated** at `4d5a456...`; controlled demo remains Conditional Go and T8 cannot close on current evidence.
- Roadmap: **Complete / Validated** at `4d5a456...`; it records the exact T8 corrective acceptance gap and preserves the T10/D-001 gate.

## 3. Evidence and validation

The T8 re-audits compared changed evidence from
`d94abb3a4d80c2174d87df4d006dfbe7c814a6bc` to `4d5a456a6d73ef5a58d674426ba889f43102a9d2`.
`bash scripts/ci-checks.sh` passed: backend build/boundary tests, Prisma validation, frontend
lint/build, development/production Compose parsing, dynamic-log check, and workflow validation.
Frontend lint retains two pre-existing warnings in `app/layout.tsx` and `utils/IconHelpers.ts`.
Source inspection verifies the live-count repair and the remaining route-switch Marker recurrence.
No focused timer/route-switch fixture, browser, Socket.IO interruption, deployment, provider,
hardware, or ambient stateful check was run.

## 4. Decisions and next action

Approved D-001 through D-006 remain unchanged. No new owner decision is proposed. The next action is
an approved Level 3 correction within the existing T8 public-state scope: ensure route selection does
not re-add a stale/expired Marker, then add focused and browser/runtime evidence before claiming T8
complete. The Level 1 freshness gate itself passes.

Confidence is **High** for the repository-visible T8 state path and re-audit status, **Medium** for
timer/route-switch runtime behavior, and **Low** for deployment, provider, physical-device, and
real-world operator outcomes.
