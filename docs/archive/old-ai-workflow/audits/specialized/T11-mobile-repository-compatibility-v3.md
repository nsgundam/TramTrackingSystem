# T11 Mobile Repository Compatibility and Gap Brief v3

This immutable brief supersedes the v2 statement that the Android repository was unavailable. It
answers only the repository-compatibility and acceptance-evidence question. The broader v1/v2
security, enrollment, claim, timeout, recovery, and runtime acceptance constraints remain binding.
It does not authorize writes to the external Mobile repository or mark T11 complete.

## 1. Trigger and focused question

- **Task:** T11
- **Trigger:** On 2026-08-07 the owner supplied the Android repository
  `https://github.com/0-Mini-Peak-1/RSUBusTrackerApp`.
- **Question:** At the supplied immutable revision, which T11 capabilities are evidenced, which
  gaps remain, and what cross-repository handoff is safe?
- **Primary playbook:** Mobile and Socket.IO. **Supporting playbook:** Identity, Security, and
  Privacy.
- **Evidence revision:**
  [`949c80369d1d133b6c03282fedaa2f475a73114b`](https://github.com/0-Mini-Peak-1/RSUBusTrackerApp/tree/949c80369d1d133b6c03282fedaa2f475a73114b),
  committed 2026-07-27T22:42:23+07:00.
- **Related evidence:** T11 v1/v2 briefs, D-005/D-007, the current Backend sender boundary, and
  [Mobile PR 1](https://github.com/0-Mini-Peak-1/RSUBusTrackerApp/pull/1).

## 2. Evidence established by the supplied repository

The source is a native Kotlin/Jetpack Compose Android application with package
`com.rsubustracker.app`, `minSdk=24`, `targetSdk=36`, and a Socket.IO Java 2.1.2 client. Static
inspection establishes the following useful but partial evidence:

1. The manifest declares coarse/fine location, foreground-service location, notification, wake-lock,
   and Internet permissions. `TrackingService` is non-exported and declared with the location
   foreground-service type.
2. Tracking begins from a visible application action, starts a persistent foreground notification,
   samples through `FusedLocationProvider`, authenticates Socket.IO with a token, and sends
   `send-location` with acknowledgement handling.
3. A disconnected Socket.IO path does not enqueue unsent locations, which is compatible with the
   T11 rule to discard offline points and sample again after reconnect.
4. Sender login plus start/end Trip HTTP calls exist. Socket.IO Java 2.x is protocol-compatible with
   the Backend's Socket.IO 4.x generation according to the upstream compatibility table.

These facts replace “Mobile application unavailable” with “Mobile source available and partially
compatible.” They do not prove a signed build, installed behavior, locked-screen continuity,
network recovery, or any other Android runtime acceptance result.

## 3. Binding gaps against T11

At the evidence revision, the application is not compatible with the approved T11 identity and
recovery contract:

1. The login screen asks a driver for Vehicle ID, Source ID, and a reusable secret. There is no
   one-time installation enrollment, activation, non-secret vehicle QR scan, exclusive claim, or
   claim/version lifecycle.
2. `CURRENT_SECRET`, `CURRENT_SOURCE_ID`, and `SENDER_TOKEN` are stored in ordinary
   `SharedPreferences`; the service re-submits the static secret to refresh access. No
   Keystore-backed refresh credential or backup-exclusion contract exists.
3. The manifest enables both application backup and cleartext traffic. The checked-in backup/data
   extraction rule files do not exclude authentication material, and the default development URL is
   plain HTTP.
4. Swiping the application away invokes `onTaskRemoved`, attempts an asynchronous Trip end, removes
   local active-Trip state, disconnects, and stops the service. This conflicts with the approved
   active-Trip lock/background continuity contract. Several end-Trip error paths also discard local
   state without an acknowledged authoritative Backend transition.
5. There is no installation revoke/re-enroll, replacement-phone recovery, timeout/no-reopen state,
   or audited Admin force-close integration.
6. No release signing/checksum/rollback record or device/OS acceptance report exists. Tests are
   template examples rather than enrollment, Trip, recovery, or foreground-service coverage; the
   instrumented example also names a package different from the application ID.

## 4. Verification result and evidence limits

A clean `testDebugUnitTest` attempt downloaded Gradle 9.2.1 but stopped before dependency/task
compilation because the inspection environment has no Android SDK and no `ANDROID_HOME`/`sdk.dir`.
Therefore the build result is **Unable to Verify**, not a pass or a source-compile failure. No device,
emulator, signing key, production endpoint, or credential was used.

The versioned, redacted external acceptance artifact defined by v2 remains mandatory. Repository
source can establish declarations and code paths, but it cannot establish foreground execution,
OEM battery behavior, installed backup behavior, network switching, GPS interruption, revoke,
replacement, timeout, or force-close behavior.

## 5. Safe cross-repository handoff

T11 must be split into coordinated contracts without declaring either half complete in isolation:

1. **Current Backend/Admin repository:** additive installation/activation/refresh/claim models and
   migrations; version-checked HTTP/Socket authentication; idempotent Trip control; receipt-time
   timeout transaction; history/exception reads; revoke/re-enroll and atomic force-close; audit and
   deterministic concurrency/restart tests; versioned OpenAPI/event/QR contract.
2. **Mobile repository:** replace Source ID/secret entry with one-time enrollment and a non-secret QR
   selector; use Keystore-backed, backup-excluded refresh material; require TLS outside explicit local
   debug builds; preserve an active Trip through task removal; retry only idempotent controls; discard
   offline GPS; handle revoke/replacement/timeout/force-close; add unit/instrumented tests and release
   metadata.
3. **Cross-repository acceptance:** pin the Backend contract version and Mobile commit/artifact,
   execute the v2 device/OS matrix, and record redacted acknowledgement traces. A Backend-only patch
   is repository progress but leaves T11 incomplete; a Mobile-only patch cannot safely invent the
   server lifecycle.

The Mobile repository is outside this workspace and the current GitHub connection is read-only for
pushes. Its source must not be changed or published without explicit write authority and a writable
checkout. The Backend handoff may be prepared here, but implementation must stop before introducing
an unconsumed or incompatible protocol if the Mobile side is not coordinated.

## 6. Recommendation and trade-offs

**Recommended:** first freeze a versioned cross-repository API/event state machine, then implement
the Backend/Admin lifecycle and Mobile client against it in coordinated slices. This prevents the
current static-secret flow from becoming a second permanent contract and gives deterministic server
tests before device testing. The cost is that T11 remains partially complete until a writable Mobile
checkout and Android acceptance target are available.

Implementing only the current Backend side would make progress sooner, but creates compatibility and
dead-code risk until the Mobile client consumes it. Reworking only Mobile would be faster to see on a
phone, but cannot safely solve claim exclusivity, revoke, receipt-time timeout, or force-close because
those invariants are server-authoritative.

## 7. Sources and confidence

- **Repository evidence (high):** immutable Mobile revision above and current Tram Tracking Backend.
- **Build/runtime evidence (unable to verify):** Android SDK/device/signing/endpoint were absent.
- **Platform facts (high, accessed 2026-08-07):**
  [Android foreground-service restrictions](https://developer.android.com/develop/background-work/services/fgs/restrictions-bg-start),
  [foreground-service declaration](https://developer.android.com/develop/background-work/services/fgs/declare),
  [Android 14 behavior changes](https://developer.android.com/about/versions/14/behavior-changes-14),
  [Auto Backup](https://developer.android.com/identity/data/autobackup), and
  [Socket.IO Java compatibility](https://socketio.github.io/socket.io-client-java/installation.html).
- **Confidence:** high for the static compatibility/gap result; low for unexecuted Android runtime
  behavior.
