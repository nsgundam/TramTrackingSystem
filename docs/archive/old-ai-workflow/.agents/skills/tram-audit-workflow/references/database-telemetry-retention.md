# Telemetry Data and Retention

- Confirm D-002 bounded raw diagnostics before designing storage or comparison claims.
- Require durable observation fields sufficient for research: source, vehicle, trip, experiment,
  event time, received time, coordinates, reported accuracy, sequence/deduplication identity,
  transport, acceptance/canonical outcome, payload version, and allowlisted radio/network metadata.
- Preserve assignment history so a later query can explain which source belonged to which vehicle.
- Define configurable raw-retention and aggregate-retention windows, deletion jobs, export rules,
  and storage-growth estimates before implementation.
- Use PostGIS indexes and bounded queries for route distance, checkpoints, bounding regions, and
  experiment maps. Verify query plans with representative volume.
- Treat distance to the known route geometry as route-conformance error, not absolute GPS accuracy.
  Record route geometry version and exclude legitimate deviations or depot/off-route segments.
- Keep device-reported accuracy as reported uncertainty, not measured error. Compare calibration
  only when a surveyed checkpoint or higher-quality synchronized reference exists.
- Test timestamp precision/timezone, duplicates, out-of-order writes, migration rollback, cascade
  behavior, retention deletion, anonymized export, and aggregate reproducibility.
