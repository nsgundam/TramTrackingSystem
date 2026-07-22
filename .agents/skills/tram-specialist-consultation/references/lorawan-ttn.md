# LoRaWAN and TTN

- Verify physical device, GPS/position source, LoRaWAN region/frequency plan, gateway topology,
  TTN application/device registration, activation method, payload codec, and webhook ownership.
- Record frame counter/message identity, event/receive time, data rate/spreading factor, frequency,
  gateway count, RSSI, SNR, consumed airtime where available, payload/firmware version, and fix data.
- Respect payload limits, duty-cycle/fair-use constraints, adaptive data rate, downlink scarcity, and
  battery goals. Do not force Mobile/ESP32 cadence onto LoRaWAN without feasibility evidence.
- Verify TTN webhook secret, device-to-source mapping, content/type limits, idempotency,
  duplicate/multi-gateway handling, out-of-order delivery, retry, status payloads, and provider
  outage behavior.
- Separate air-interface latency from TTN/webhook delivery latency and device clock uncertainty.
- Test gateway coverage gaps, indoor/obstructed segments, reboot/join, frame-counter continuity,
  delayed/duplicate webhook, decoder version change, TTN outage, and webhook rotation.
- Treat vendor/provider metrics according to their documented semantics; cite current TTN and
  LoRaWAN primary documentation in any binding recommendation.
