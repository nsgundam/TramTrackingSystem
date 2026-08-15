# T11 Identity/Mobile Acceptance Contract v2

Supersedes [T11 identity/mobile sender enrollment v1](T11-identity-mobile-sender-enrollment.md). This revision is binding only for the Android compatibility and acceptance-evidence question; it does not authorize a Level 3 implementation.

## 1. Trigger and focused question

- **Task:** T11
- **Trigger:** The v1 brief required a supported Android device/OS matrix and external acceptance evidence. The owner confirms real locked-screen sending has been tested, requests broad device compatibility rather than a named fleet, accepts the existing 15-minute access token with revocable refresh credentials, and selects Admin-log-only visibility for GPS-timeout closure.
- **Question:** What compatibility boundary and external Android acceptance artifact are sufficient for T11 without claiming untested all-device support?
- **Evidence paths:** docs/audits/specialized/T11-identity-mobile-sender-enrollment.md, docs/decision-queue.md, docs/roadmap/master-refactoring-roadmap.md, shuttle-tracking-backend/src/controllers/auth.controller.ts, shuttle-tracking-backend/src/middleware/auth.ts, and shuttle-tracking-backend/src/server.ts.
- **Primary playbook:** Identity, Security, and Privacy. **Supporting playbook:** Mobile and Socket.IO.
- **Output:** This immutable v2 brief.

## 2. Binding decision

1. T11 supports Android phones generically only where the installed App, Android version, location permissions, and foreground-service runtime pass the acceptance contract. It makes **no universal model or Android-version compatibility claim**.
2. The Android app continues location delivery during a Trip through the platform-supported location foreground-service path with a persistent user-visible notification. The real locked-screen test is owner-provided field evidence, but not a release artifact until recorded below.
3. Keep the current 15-minute access-JWT default. Add a rotatable/revocable refresh credential in an Android Keystore-backed and backup-excluded store; server status/version revalidation must fail HTTP and Socket.IO writes immediately after revoke.
4. A gps_timeout closure is visible in the authenticated Admin exception/log surface only. It does not create rider outreach, mobile push, SMS, email, or a new escalation channel in T11.
5. T11 is limited to Sender/shared-phone installation and operational recovery. It must not add administrative-user/role provisioning, promotion, demotion, or removal UI. That remaining D-007 account-lifecycle decision stays outside this task.

## 3. Required external acceptance artifact

The Android team must provide one versioned, redacted acceptance report before T11 can be marked complete. It must contain:

- App package ID, version name/code, release artifact SHA-256, signing-certificate SHA-256 fingerprint, distribution/update owner, release date, and rollback version. Never include activation, refresh, access, or Sender secrets.
- Each test device's manufacturer/model, Android version/API level, app target SDK, location-permission state, battery-optimization state, and test-network type. This is a record of tested coverage, not a product-wide support promise.
- Result, timestamp, build identifier, and redacted request/acknowledgement traces for: one-time enrollment; non-secret vehicle QR claim; foreground/background/locked-screen location; location permission or GPS disable; Wi-Fi/cellular switch; Backend outage/reconnect with offline-point discard and new sample; access-token refresh/expiry; installation disable/revoke/replacement; normal Trip end/switch lock; 10-minute timeout/no-reopen; and Admin force-close/release.
- Confirmation that location foreground-service manifest type/permissions match the target Android SDK, that refresh material uses Android Keystore storage and is excluded from backup/device transfer, and that no secret appears in logs or QR payloads.
- Known unsupported or untested conditions, plus the Android-team sign-off. A report that omits an actual device/OS tuple proves no runtime compatibility.

## 4. Rationale and alternatives

The selected approach permits future devices without making an unfounded compatibility statement. A fixed fleet matrix would be more precise but conflicts with the owner's flexible-device intent; an all-Android claim would be unverifiable and unsafe. The existing short-lived access token plus revocable refresh credential limits damage from a lost phone while retaining continuous Trip operation. Admin-log-only timeout visibility respects the owner decision and keeps notification design out of T11.

Android documentation requires the correct foreground-service type and permissions for location work, with additional declaration requirements for Android 14/API 34 and later. Android Keystore keys are designed to keep key material non-exportable; this supports a protected local refresh-credential design but does not prove a particular team's implementation.

## 5. Exact future implementation handoff

After affected audits are fresh, the exact T11 Level 3 spec must bound additive schema/migration, enrollment/claim/refresh APIs, source/claim revalidation, the authoritative Trip timeout/recovery transaction, protected Admin history/exception pages, and deterministic tests. It must also deliver the Android interface contract and make the external report above an acceptance prerequisite; it must not write an Android repository unavailable in this workspace.

## 6. Failure modes and rollout limits

- Treating a successful test on one phone as universal support would overstate evidence.
- Starting a location service incorrectly from background, missing target-SDK declarations, a revoked refresh credential, a copied vehicle QR, or stale offline GPS must fail safely.
- A package/signing change without the recorded artifact/fingerprint invalidates prior acceptance evidence.
- No migration, ambient runtime, production, provider, or hardware test is authorized by this brief.

## 7. Open gates

- The external Android acceptance artifact is still required; it cannot be created from Backend/Admin tests.
- Architecture, Backend, Frontend, Database, Dashboard & UX, Security, Production Readiness, and Roadmap are currently Needs Re-audit after T10.
- Global D-007 account-lifecycle, privileged deletion, and re-authentication policy stays outside T11 unless a later exact handoff requires it.

## 8. Evidence classification, sources, and confidence

- **Owner decision (high):** broad-device intent, confirmed real locked-screen test, 15-minute access token with revocable refresh credential, Admin-log-only timeout visibility, and no T11 account-management scope.
- **Repository evidence (high):** current Sender JWT expiry and server-side source/vehicle/version revalidation; no mobile installation/claim/refresh model exists yet.
- **External platform facts (high, accessed 2026-08-01):** [Android foreground-service types](https://developer.android.com/develop/background-work/services/fgs/service-types), [Android Keystore](https://developer.android.com/privacy-and-security/keystore), [Android Auto Backup](https://developer.android.com/identity/data/autobackup), and [Socket.IO client options](https://socket.io/docs/v4/client-options/).
- **Android runtime evidence (unable to verify):** the owner reports testing, but no versioned external report or artifact was supplied.
- **Confidence:** high for the contract; low for unreported device/OS coverage.

