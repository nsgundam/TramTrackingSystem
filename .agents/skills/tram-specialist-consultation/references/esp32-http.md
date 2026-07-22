# ESP32 and HTTP

- Record ESP32 board, GPS module/chipset, antenna, firmware/toolchain/library versions, power source,
  mounting, Wi-Fi environment, coordinate datum, and fix-quality fields.
- Define GPS parsing, fix validity, event time source, NTP/GNSS synchronization, sampling cadence,
  payload/sequence ID, reported accuracy or HDOP semantics, and schema version.
- Use authenticated HTTPS in production; store device credentials outside source, bind them to one
  source/vehicle, and support provisioning, rotation, revocation, and safe recovery.
- Bound HTTP timeout, exponential backoff/jitter, offline queue, retry lifetime, deduplication,
  payload size, memory, flash writes, and watchdog behavior.
- Capture approved diagnostics such as Wi-Fi RSSI, fix age/type, satellites, HDOP, retry count,
  firmware version, reset reason, and battery/voltage when hardware supports them.
- Test cold/warm GPS start, weak Wi-Fi, AP loss, DNS/TLS failure, backend outage, full queue, power
  cycle, corrupted fix, clock drift, credential rotation, and firmware upgrade/rollback.
- Do not introduce MQTT unless measured fleet/network requirements outperform the existing bounded
  HTTP design.
