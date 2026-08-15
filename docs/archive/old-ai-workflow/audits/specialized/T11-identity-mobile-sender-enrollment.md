# T11 Identity/Security Decision Brief — Shared Android Phone Enrollment, Vehicle Claim, and Recovery

## 1. Trigger and focused question

Task: `T11`.

The owner selects an Android Native GPS Sender Application installed on shared university phones.
Each phone is enrolled once, then selects a vehicle through its QR without entering `SOURCE_ID` or
contacting an Admin for routine changes. One vehicle may have one active Mobile claim. Mobile
drivers start their Trips; Admin controls Trip start for LoRaWAN/IoT. The App discards offline GPS,
continues its approved location runtime while locked, and cannot switch vehicle/profile until its
active Trip ends.

The owner also approves a 10-minute all-source GPS timeout and Admin recovery for lost, broken, or
replaced shared phones.

Focused question: **What final identity, enrollment, vehicle-claim, Trip-timeout, Admin-recovery,
Android-runtime, and validation contract binds T11?**

Primary playbook: Identity, Security, and Privacy. Supporting playbook: Mobile and Socket.IO.

## 2. Current evidence and constraints

- `shuttle-tracking-backend/src/controllers/auth.controller.ts` currently accepts `sourceId`,
  `secret`, and optional `vehicleId`, verifies the stored bcrypt hash, rejects vehicle mismatch, and
  issues a Sender JWT.
- The current JWT contains Sender kind, `sourceId`, bound `vehicleId`, and `credentialVersion`; its
  default lifetime is 15 minutes through `SENDER_JWT_EXPIRES_IN`.
- `shuttle-tracking-backend/src/middleware/auth.ts` and `src/server.ts` revalidate source status,
  type, vehicle, and credential version for protected HTTP/Socket.IO writes. Rotation,
  reassignment, or revocation can therefore invalidate old writes.
- `shuttle-tracking-backend/src/controllers/devices.controller.ts` hashes Sender secrets and
  increments `credentialVersion` on rotation. There is no current installation enrollment,
  refresh-credential, vehicle-claim, or installation audit entity.
- `shuttle-tracking-backend/src/controllers/trips.controller.ts` and
  `src/services/operations.service.ts` provide Sender-bound idempotent Trip lifecycle operations.
- Current `TrackingSource` state binds one source to one `vehicleId`. Self-service vehicle switching
  requires an additive claim/assignment boundary; hiding the existing `SOURCE_ID` field is not
  sufficient.
- T7 research and canonical selection require stable internal source provenance. `SOURCE_ID` must
  disappear from driver UX but remain server-side.
- Sampled `GPSTrack` history is not a safe inactivity clock because accepted GPS observations may be
  intentionally omitted by sampling.
- Android source is owned by another team and is unavailable in this repository. Android runtime
  behavior requires a versioned interface contract and external build/device acceptance evidence;
  Backend/Admin evidence alone cannot prove it.
- Product through Roadmap remain `Needs Re-audit`. This brief records approved policy and technical
  constraints but does not authorize implementation by itself.

## 3. Final approved decision and binding implementation contract

### 3.1 Identity and authority model

Use a stable internal `MobileSenderInstallation` identity for each enrolled shared phone. This is an
installation identity, not proof of which individual person is driving. Do not label it as Driver
identity in audit, research, or operational reports.

`ADMIN`, `SUPER_ADMIN`, and `DEV` inherit authority to create/enroll, list, disable, revoke, and
re-enroll shared Mobile Sender installations. These are Sender/device operations, not
administrative user-role creation. No Admin credential or role token may be placed in the Android
App.

Keep server-generated `sourceId`/installation identity internal for provenance, canonical
selection, credential revocation, and Mobile/ESP32/LoRaWAN research comparisons. Record the
effective vehicle, claim, and Trip assignment on accepted evidence so vehicle switching never
rewrites historical source meaning.

### 3.2 Enroll a shared phone once

1. `ADMIN` or higher creates a Mobile Sender installation in the Admin UI.
2. Backend generates a high-entropy, short-lived, single-use activation value. Store only its hash
   and bind it to installation/version/creator/expiry. It may be rendered as an enrollment QR, but
   this QR is used only for initial enrollment or re-enrollment.
3. The Android App redeems it once over TLS and registers its random installation identifier.
4. Backend returns a rotatable/revocable opaque installation refresh credential plus a short-lived
   access JWT. Store only the refresh-credential hash server-side.
5. Android protects the refresh credential with an Android Keystore-backed key, excludes the
   credential/profile store from backup/device transfer, and never logs or stores activation,
   access, refresh, `SOURCE_ID`, or permanent `SOURCE_SECRET` values in plaintext.
6. The App refreshes access before expiry and passes the current token in Socket.IO `auth`.
   Installation disable/revoke or credential/claim version change must fail HTTP and Socket.IO
   revalidation immediately.

Routine vehicle changes never require a new activation. Reinstalling the App, clearing protected
data, replacing the phone, or revoking a lost phone is a new enrollment event. A replacement gets a
new installation/credential generation and never recovers the old secret from backup.

The current `POST /api/auth/vehicle-login` may remain temporarily for simulators or a bounded
migration window. The Android target must not persist or repeatedly request `SOURCE_SECRET`.

### 3.3 Claim a vehicle through a static non-secret QR

The QR fixed to each vehicle contains only a versioned opaque public selector, for example:

```json
{ "v": 1, "vehicleCode": "<opaque public selector>" }
```

The QR is a selector, not authentication. A copied QR cannot publish GPS without an active enrolled
installation session and a successful server claim.

The App sends its authenticated installation session plus `vehicleCode`. In one transaction the
Backend verifies installation and vehicle state, rejects conflicting claims, creates a
`VehicleClaim`, and returns a short-lived Sender token bound to installation/source, `vehicleId`,
claim ID/version, expiry, and allowed Sender actions.

Enforce server-side:

- at most one active Mobile claim per vehicle;
- at most one active vehicle claim per shared-phone installation;
- source/installation/claim/vehicle/Trip match on every HTTP and Socket.IO write;
- inactive, disabled, revoked, expired, or wrong-version credentials fail closed.

An optional printed short code or NFC tag may be added later only as another representation of the
same non-secret `vehicleCode` under the same authenticated claim request. It is not approved as a
credential or a separate trust path.

### 3.4 Trip switching, offline data, and Android runtime

Normal Mobile flow:

1. enrolled phone claims the selected vehicle;
2. driver starts the Trip from a visible user action;
3. App starts the approved Android `location` foreground-service path and shows its persistent
   notification;
4. App sends only current observations under the claim-bound token;
5. driver ends the Trip and waits for Backend acknowledgement;
6. Backend completes the Trip and releases the claim;
7. only then does the App enable vehicle/profile change and a new QR scan.

The UI lock is not authoritative. The Backend must reject a second claim or cross-vehicle write even
from a modified, duplicated, or racing App.

Location observations are live facts: do not persist or replay an offline GPS queue. On reconnect,
discard unsent points, obtain a new location, refresh authentication if required, and send only the
current observation. Do not enable Socket.IO packet retries for `send-location`.

Trip start/end, enrollment, rotation, and recovery are control operations. Retry only through
idempotent server operations and explicit acknowledgements; do not discard an unacknowledged Trip
end as if it were GPS telemetry.

The external Android team must test foreground/background/locked screen, permission downgrade, GPS
disabled, force-stop, reboot, Wi-Fi/mobile switch, Backend outage, reconnect, token expiry,
disable/revoke, Trip-end lock, QR claim, and timeout recovery on the supported university device/OS
matrix. Internal distribution does not bypass Android location or foreground-service rules.

### 3.5 Accepted Backend receipt-time timeout

The 10-minute inactivity rule applies to Mobile, ESP32, and LoRaWAN.

For every GPS observation that passes authentication, binding, validation, ordering/replay checks,
and acceptance for the active Trip, atomically set `lastAcceptedAt` to Backend receipt time. Device
event time and sampled `GPSTrack.createdAt` do not control the timeout. Rejected, replayed,
wrong-claim, wrong-vehicle, or post-close input must not advance it.

Define `timeoutAt = lastAcceptedAt + 10 minutes`. The ingestion path and a durable scheduled/sweeper
path must use the same transactional/idempotent close operation. If GPS arrives after `timeoutAt`
before the sweeper records closure, close the expired Trip first and reject the observation as
requiring a new Trip.

Timeout closure performs exactly once:

1. `closeReason = gps_timeout`;
2. `endTime = lastAcceptedAt`;
3. `closedAt = Backend detection time`;
4. release/end the Mobile claim when present;
5. invalidate the old claim/token version;
6. preserve all Trip, telemetry, research, claim-history, and audit evidence;
7. reject later GPS without reopening or extending the Trip.

A new Trip is always required after timeout. ESP32 and LoRaWAN use the same Trip close semantics but
do not acquire a Mobile vehicle claim.

### 3.6 Admin lost-phone recovery and emergency force-close

Preserve installation identity and history through explicit states such as `active`, `disabled`,
`revoked`, and `replaced`; do not delete old installations. Disable/revoke must immediately
invalidate refresh, access, HTTP, Socket.IO, and active-claim authority through version/status
revalidation. Re-enrollment creates a new credential generation/installation for the replacement.

When a shared phone is lost or broken while its Mobile Trip remains active, `ADMIN` or higher may
run one protected atomic/idempotent operation, conceptually
`forceCloseMobileTripAndReleaseClaim`. Require authentication, explicit confirmation, a bounded
reason category such as `device_lost`, `device_broken`, or `operational_takeover`, an optional
bounded note, and an idempotency key.

In one transaction or equivalent single lifecycle operation:

1. lock and revalidate Trip, claim, vehicle, and installation versions;
2. disable/revoke the failed installation when requested;
3. close the Trip with `closeReason = admin_force_close`;
4. set `endTime` and `closedAt` to Backend execution time;
5. preserve `lastAcceptedAt` as the latest accepted telemetry receipt time;
6. end/release the Mobile claim with an Admin emergency reason;
7. invalidate the old credential/claim version;
8. append an immutable audit event containing actor ID/role, reason, bounded note, affected IDs,
   before/after state, server timestamp, and request/correlation ID;
9. return the existing completed result for safe duplicate requests.

`admin_force_close` is distinct from `gps_timeout`: it is an authenticated operational decision at
execution time, not an inferred end at last telemetry. It is lifecycle recovery, not deletion, and
must not delete or rewrite Trip, GPSTrack, raw research, canonical, claim, credential-history, or
audit evidence.

An old-phone GPS write racing this operation either commits before the locked transition or fails
after it. It must never reopen the Trip, recreate the claim, or advance `lastAcceptedAt` after
closure. The replacement phone may claim the vehicle only after successful release.

### 3.7 Admin UI and internal Android distribution

Admin UI may expose:

- installation status and safe last-seen metadata without credentials;
- initial enrollment, Disable, Revoke, and Re-enroll actions;
- vehicle QR generation/display/print;
- active claim and timeout/recovery exception visibility;
- emergency Force-close and release only for an active Mobile Trip/claim;
- a confirmation showing vehicle, Trip, installation, latest accepted GPS time, and required reason.

UI hiding is not authorization. Every endpoint and Socket.IO write independently enforces role,
installation state/version, claim, vehicle, and Trip state.

Use a release-signed APK and controlled university distribution/update record with package name,
version code/name, signing-certificate fingerprint, checksum, release owner, supported Android
versions, rollout date, and rollback package. Protect and back up the signing key.

## 4. Alternatives and trade-offs

| Alternative | Benefit | Cost/risk | Disposition |
|---|---|---|---|
| Shared phone enrolled once + non-secret vehicle QR + Admin recovery | Lowest routine friction, revocable installation, urgent recovery | Identifies installation rather than person; requires claim/recovery state and race tests | **Selected** |
| Individual Driver login/SSO + vehicle QR | Stronger person-level accountability | Adds login/account lifecycle and was not selected | Deferred unless accountability requirements change |
| Continue `VEHICLE_ID`/`SOURCE_ID`/`SOURCE_SECRET` login | Smallest Backend change | Reusable secret exposure and fragile switching/rotation | Compatibility migration only |
| Credential-bearing vehicle QR | Scan-only authentication | Copied QR enables impersonation until rotation | Rejected |
| Multiple simultaneous Mobile claims for one vehicle | Easy ad hoc takeover | Conflicting authority and ambiguous provenance | Rejected |
| Wait only for normal end/10-minute timeout after phone failure | Simplest recovery surface | Delays urgent replacement | Replaced for emergencies; remains normal path |
| Restrict recovery to `SUPER_ADMIN` | Smaller operator set | Conflicts with approved Admin Sender operations | Rejected |
| Delete old installation/Trip/claim | Removes stale-looking records | Destroys provenance and conflates recovery with deletion | Rejected |
| Android Keystore proof-of-possession key pair | Stronger non-exportable device binding | More protocol, recovery, and attestation complexity | Future hardening if measured risk justifies it |

## 5. External primary sources reviewed

Research date: **2026-08-01**.

- Android Keystore system: app-specific keys and use restrictions.
  <https://developer.android.com/privacy-and-security/keystore>
- Android foreground-service types: location service declaration, permissions, and restrictions.
  <https://developer.android.com/develop/background-work/services/fgs/service-types>
- Android background-location guidance: background limits and user-visible purpose.
  <https://developer.android.com/develop/sensors-and-location/location/background>
- Android Auto Backup: backup scope, exclusions, and credential-storage considerations.
  <https://developer.android.com/identity/data/autobackup>
- Android app signing: install/update signing identity.
  <https://developer.android.com/studio/publish/app-signing>
- Android developer verification for outside-Play distribution.
  <https://developer.android.com/developer-verification/guides/android-developer-console>
- Socket.IO 4.x client options: dynamic `auth`, reconnection, acknowledgements, and packet retries.
  <https://socket.io/docs/v4/client-options/>

These sources constrain the target design; they do not prove the other team's current Android App
implements it.

## 6. Exact implementation handoff

Expected Backend/schema scope to narrow into an exact Level 3 allowlist after re-audit:

- `shuttle-tracking-backend/prisma/schema.prisma` and an additive migration for installation,
  activation, refresh version/hash, claim, close reason/timestamps, and immutable audit data;
- `shuttle-tracking-backend/src/controllers/auth.controller.ts`;
- `shuttle-tracking-backend/src/controllers/devices.controller.ts`;
- `shuttle-tracking-backend/src/controllers/trips.controller.ts`;
- `shuttle-tracking-backend/src/middleware/auth.ts`;
- `shuttle-tracking-backend/src/middleware/validation.ts`;
- `shuttle-tracking-backend/src/routes/auth.route.ts`;
- `shuttle-tracking-backend/src/routes/trips.route.ts`;
- `shuttle-tracking-backend/src/services/operations.service.ts` as the authoritative lifecycle
  owner;
- `shuttle-tracking-backend/src/server.ts` for Socket.IO claim/version revalidation;
- a durable timeout runner under a path selected during Architecture/Backend re-audit;
- focused enrollment, role, QR claim, Trip, timeout, revoke, idempotency, restart, and race tests.

Expected Admin scope includes shared-phone lifecycle controls, vehicle QR, active claims, Trip
history/exceptions, safe confirmations/reasons, safe errors, and role-specific tests.

The Android repository/path remains unavailable by owner constraint. Deliver a versioned API/event
contract to that team and require an external acceptance report containing App build/version,
package/signing fingerprint, supported test device/OS, redacted request/ack traces, Keystore/backup,
enrollment, QR claim, locked-screen runtime, offline discard, token expiry, revoke/replacement,
Trip-end lock, timeout, and emergency-recovery results. Do not represent Backend/Admin completion as
verified Android completion.

## 7. Required validation

1. Activation is short-lived and single-use; expiry/replay cannot enroll another installation or
   enumerate a source.
2. Activation/refresh/access/Sender secrets never appear in vehicle QR, logs, list responses,
   analytics, exports, backups, or audit notes.
3. Refresh material is hashed server-side, Keystore-protected on Android, excluded from backup, and
   bound to installation/version.
4. Copied vehicle QR cannot claim or publish without an active enrolled installation session.
5. Two phones racing for one vehicle yield one active Mobile claim; one phone cannot claim two
   vehicles, even with concurrent or modified clients.
6. Source/installation/vehicle/claim/Trip mismatch fails HTTP and Socket.IO writes.
7. Normal Trip end completes before vehicle switching and releases/invalidate the claim exactly
   once.
8. Offline GPS is discarded; reconnect sends a newly sampled point. Start/end/recovery controls
   retain idempotent acknowledgement behavior.
9. Only an accepted Backend-received observation advances `lastAcceptedAt`; device timestamps,
   sampled `GPSTrack`, rejected input, and replay cannot keep a Trip alive.
10. Arrival after `timeoutAt` closes the old Trip with `gps_timeout` and is rejected; it never
    extends or reopens the Trip.
11. Timeout remains identical for Mobile, ESP32, and LoRaWAN except Mobile claim release.
12. Disable/revoke immediately rejects old refresh, HTTP, and Socket.IO credentials. Replacement
    enrollment produces a new identity/credential generation and preserves old history.
13. Emergency force-close requires `ADMIN` or higher, confirmation, reason, and idempotency; records
    `admin_force_close`, execution-time `endTime/closedAt`, preserved `lastAcceptedAt`, actor/audit,
    released claim, and invalid token exactly once.
14. Emergency recovery never deletes Trip, telemetry, raw research, canonical, claim, credential, or
    audit evidence.
15. Concurrent accepted GPS, timeout sweeper, normal end, disable/revoke, and duplicate Admin
    requests result in one terminal Trip state and no duplicate active claim.
16. Restart and multiple Backend instances cannot miss/duplicate timeout or recovery transitions.
17. Historical installation/source/vehicle/Trip provenance remains reproducible after switches and
    phone replacement.
18. External Android evidence covers supported devices/OS, signing/update, backup/reinstall,
    foreground/background/lock, permission/network failures, revoke/replacement, and timeout/Admin
    recovery.

## 8. Failure modes and rollout risks

- Shared-phone identity cannot establish which individual person drove the vehicle.
- Client-only switching or claim locking can be bypassed; database/transaction constraints are
  mandatory.
- A static vehicle QR is copyable and is safe only as a non-secret selector.
- Restored credential files may cause identity reuse; exclude them from backup and re-enroll.
- A 15-minute access token can expire during a Trip; refresh failure must surface and fail closed.
- Packet retries can replay stale GPS contrary to the offline-discard decision.
- Rebinding one mutable source row directly to vehicles can corrupt research provenance.
- Device event time or sampled `GPSTrack` can create incorrect timeout behavior.
- A process-local timer can miss/duplicate close across restart or replicas.
- Separate revoke/close/release calls can partially succeed and briefly allow two publishers.
- Force-close racing accepted GPS can create inconsistent timestamps without one serialized
  lifecycle operation.
- Losing the Android signing key can prevent trusted updates; compromising it can enable malicious
  updates.
- Android foreground/location behavior varies by OS/target SDK; internal distribution does not
  remove platform rules.

## 9. Remaining parameters and owner decisions

No owner-controlled decision remains for the focused T11 Mobile enrollment, QR selection, exclusive
claim, switch rule, offline behavior, accepted receipt-time timeout, lost-phone lifecycle, or Admin
emergency recovery policy.

Activation/access lifetimes, refresh rotation cadence, installation-state enum, reason enum/note
limit, idempotency retention, database constraint form, timeout runner cadence, transaction
isolation, notification behavior, supported Android device/OS matrix, and any global D-007 recent
re-authentication rule are re-audit/implementation parameters. They must be documented and tested
without weakening the approved invariants.

## 10. Evidence classification and confidence

- Owner evidence: **High confidence** for shared-phone enrollment, QR vehicle selection, one active
  Mobile claim per vehicle, pre-switch Trip end, offline discard, all-source timeout, accepted
  Backend receipt-time clock, no reopening, Admin revoke/re-enrollment, and emergency force-close/
  release.
- Repository evidence: **High confidence** for the current Sender secret/JWT/version revalidation and
  idempotent Trip boundaries; **Medium confidence** for exact additive schema/API placement until
  re-audit.
- External platform/protocol evidence: **High confidence** for the cited Android and Socket.IO
  documentation as reviewed on 2026-08-01.
- Android runtime: **Unable to Verify** without the external team's build/device acceptance evidence.
- Multi-instance/field behavior: **Unable to Verify** until stateful concurrency, restart, and field
  acceptance tests pass.
