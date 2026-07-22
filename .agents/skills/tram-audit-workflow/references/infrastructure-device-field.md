# Infrastructure, Devices, and Field Experiments

## Fixed source boundaries

- Mobile: obtain GPS on a phone and send through authenticated Socket.IO.
- ESP32: obtain GPS from a connected module and send over Wi-Fi through authenticated HTTP.
- LoRaWAN: use a separate location device through gateway, TTN, and authenticated webhook.

## Audit checklist

- Record hardware/module model, firmware/app version, antenna placement, mounting, power source,
  sampling/transmit cadence, coordinate datum, time source, payload version, and provisioning method.
- Inspect Mobile background-location permissions, OS throttling, reconnect, app suspension, and
  network transitions.
- Inspect ESP32 Wi-Fi association, GPS fix state, NTP/GNSS time, HTTP timeout/retry/backoff, offline
  queue, watchdog, credential storage/rotation, flash wear, and power behavior.
- Inspect LoRaWAN region/frequency plan, gateway coverage, payload size/codec, confirmed/unconfirmed
  uplinks, frame counters, duty-cycle/fair-use limits, data rate, RSSI/SNR, TTN retry/deduplication,
  and webhook delivery.
- Use identical routes, mounting positions, test windows, cadences where feasible, and documented
  environmental conditions. Avoid declaring a transport superior from one trip.
- Capture stationary surveyed checkpoints plus moving-route sessions when practical. Use route
  distance only as a secondary proxy.
- Test cold/warm start, tunnel/building obstruction, gateway/network loss, reconnect, power cycle,
  duplicate/reordered messages, clock drift, and controlled failover.
- Never infer physical performance from simulators; label simulator, bench, field, and pilot evidence.
