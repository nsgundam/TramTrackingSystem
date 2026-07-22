# Production Readiness

- Synthesize only validated predecessor findings; do not use this profile to discover a missing
  subsystem audit.
- Gate release claims separately for controlled demo, research field trial, internal operations,
  and public rider service.
- Require a supported sender/device lifecycle, physical test evidence, current provider/topology,
  secure provisioning/rotation, bounded retention, backup/restore, monitoring/alerts, incident
  ownership, and rollback evidence for the intended stage.
- Require field-test evidence across representative route sections, coverage conditions, device
  mounting, operating duration, reconnect/power cycles, and failure recovery. Report sample size and
  limitations.
- Confirm Dev Dashboard authorization, query/export bounds, metric definitions, data completeness,
  privacy controls, and reproducibility before presenting comparisons as research results.
- Confirm rider UI remains canonical-only and labels stale/no-service truthfully despite research or
  source failure.
- Stop release on unresolved critical security, data-loss, misleading-accuracy, migration,
  provisioning, or all-sources-stale behavior. Return hardware, privacy, retention, topology, and
  operational-scope choices to the owner.
