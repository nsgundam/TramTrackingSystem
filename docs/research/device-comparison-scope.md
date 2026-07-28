# Three-Device Comparison Scope

Status: Approved initial scope on 2026-07-22. Implementation remains gated by audit revalidation,
roadmap dependencies, exact task specifications, and the unresolved parameters below.

## Research sources

| Source | Acquisition | Transport boundary |
|---|---|---|
| Mobile | Phone GPS | Authenticated Socket.IO |
| ESP32 | Separate ESP32 with connected GPS module | Wi-Fi and authenticated HTTP |
| LoRaWAN | Separate LoRaWAN location device | Gateway → TTN → authenticated webhook |

Simulators validate the pipeline but are not a fourth physical research source and cannot prove
device, radio, provider, clock, battery, or field performance.

## Developer Dashboard scope

Provide an authenticated developer/research surface with:

- live Mobile, ESP32, and LoRaWAN positions plus canonical position;
- online, stale, and offline state with event and receive timestamps;
- latency, update interval/jitter, availability, accepted/rejected/duplicate/missing rates;
- reported device accuracy, distance to versioned route geometry, pairwise source disagreement, and
  measured ground-truth error when reference evidence exists;
- source-selection share and failover outcomes;
- allowlisted battery/network/radio data such as Wi-Fi RSSI or LoRaWAN RSSI/SNR when supplied;
- historical experiment/session filters by vehicle, route, source, device/firmware, and time range;
- bounded, redacted CSV/JSON export with metric/schema definitions.

Keep this surface separate from the public canonical tracker and ordinary operations UI. Enforce
authorization and query/export bounds on the server.

## Accuracy semantics

- `route-conformance distance`: shortest geodesic distance to the versioned expected route; useful as
  a proxy, but not absolute GPS accuracy because route geometry, detours, and lane position can vary.
- `reported accuracy`: uncertainty supplied by the phone, GPS module, or provider; not measured
  error. Preserve producer, original field, unit, and semantic kind. HDOP is dimensionless and must
  not be stored or compared as meter-based uncertainty. Test calibration only against reference
  evidence.
- `pairwise disagreement`: distance between approximately time-aligned sources; identifies
  disagreement but cannot determine which source is correct.
- `ground-truth error`: distance to a surveyed checkpoint or higher-quality synchronized reference.
  This is required for an absolute accuracy claim.

Use known route geometry for the initial moving experiment, while adding stationary surveyed
checkpoints or a higher-quality reference receiver when practical. Never silently map-snap raw
points before accuracy analysis.

## Unresolved implementation parameters

- Raw and aggregate retention duration, deletion owner, and research-access role.
- Physical device/GPS module models, firmware versions, antenna/mounting, and power arrangement.
- TTN application/device identifiers, gateway/coverage facts, frequency plan, and payload codec.
- Clock-synchronization method and timestamp semantics for end-to-end latency.
- Experiment repetition, checkpoints/reference receiver, route exclusions, and minimum sample size.

Level 2 must research these as focused task-keyed questions using repository evidence, current
primary sources, and field evidence before Level 3 implements a binding design.
