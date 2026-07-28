# Product and Research Design

- Convert the request into one falsifiable comparison question and a decision it will inform.
- Define population, route, test segments, device mounting, cadence, duration, repeats, conditions,
  exclusions, outcomes, and minimum useful evidence before choosing charts or schema.
- Keep Mobile/Socket.IO, ESP32+GPS/Wi-Fi/HTTP, and independent
  LoRaWAN/Gateway/TTN/Webhook as three treatment sources. Treat simulators as pipeline controls.
- Control what can be controlled: simultaneous runs, antenna placement, sampling cadence, route,
  time window, vehicle speed, firmware/payload version, and weather/obstruction notes.
- Avoid a single winner score unless the owner approves metric weights. Report accuracy, latency,
  delivery, coverage, power, maintainability, and cost separately.
- Use repeated stationary checkpoints and repeated moving-route sessions; do not generalize from one
  trip or one device unit.
- Define experiment/session IDs, operator notes, ground-truth method, route geometry version,
  consent/privacy handling, retention, and reproducible export.
- State threats to validity including unsynchronized clocks, different cadences, map error, device
  placement, correlated failures, missing data, and provider retry behavior.
