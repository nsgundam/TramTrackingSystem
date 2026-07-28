# Telemetry and Geospatial Analysis

- Distinguish measured ground-truth error, route-conformance distance, device-reported accuracy,
  pairwise source disagreement, and canonical-source difference. Never label them interchangeably.
- Compute route conformance as shortest geodesic distance from observation to the versioned route
  geometry. Exclude depots, detours, stops outside the polyline, and known geometry defects.
- Treat the accuracy field as the device/provider's estimated horizontal uncertainty; validate its
  calibration by checking what share of reference errors falls within the reported radius.
- Prefer surveyed checkpoints or a higher-quality synchronized reference receiver for absolute
  error. If unavailable, report route distance and pairwise disagreement as proxies only.
- Separate event, receive, process, selected, and display times. Calculate network/end-to-end
  latency only when clock synchronization and timestamp semantics are credible.
- Report sample count, missingness, p50/p95/p99, distribution, bias, RMSE/MAE where justified,
  availability, update interval/jitter, duplicate/reject rate, and confidence/uncertainty.
- Analyze stationary and moving segments separately and stratify by route segment, obstruction,
  speed, source, device/firmware, and experiment.
- Use robust handling for outliers but retain and explain raw/excluded counts; never silently snap
  observations to the road before accuracy analysis.
