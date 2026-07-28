# Mobile and Socket.IO

- Inspect OS/application GPS API semantics, permission level, reported horizontal accuracy,
  event timestamp, background execution, battery policy, and location-provider changes.
- Verify authenticated Socket.IO handshake and per-write revalidation, source/vehicle binding,
  acknowledgement, reconnect/backoff, connection-state visibility, and token refresh/rotation.
- Define sequence or observation ID, offline queue limit, duplicate handling, order, retry lifetime,
  and behavior when a trip ends or the app resumes.
- Capture app/OS/device model, location settings, network type, battery state if approved, payload
  version, and clock-sync evidence without collecting unrelated personal data.
- Test foreground/background/locked app, permission downgrade, GPS disabled, Wi-Fi/cellular switch,
  tunnel/building obstruction, server outage, reconnect, stale token, and device reboot.
- Compare power and cadence using controlled settings; do not attribute OS throttling to Socket.IO
  transport without evidence.
- Preserve canonical selection on the server; the phone must not claim authority over vehicle state.
