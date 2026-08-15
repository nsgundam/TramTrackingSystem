# Deployment and Release Boundaries

The repository supplies Docker Compose configurations for local development and a production-mode
template. It does not establish that a production environment exists or is ready.

## Configuration boundaries

- Use `env.example` only as a local configuration template. Keep real credentials in an ignored,
  access-controlled environment file or secret store.
- Development seed accounts are created only when `SEED_ADMIN_PASSWORD` is supplied; no checked-in
  default password is valid.
- Production configuration must use non-placeholder secrets, a private database and Redis,
  explicit permitted origins, and the intended reverse-proxy/TLS topology.
- Do not expose PostgreSQL or Redis publicly. Client-visible configuration must never contain
  backend secrets, database URLs, Redis URLs, or webhook/source credentials.

## Release evidence

Before an owner-approved release, record the exact source/version, configuration change, migration
compatibility, tests/CI, known limitations, and rollback decision. Run a migration only after the
target, backup, expected result, rollback/recovery path, and operator authority are explicit.

Repository CI and Compose parsing cover source/configuration contracts. They do **not** prove:

- actual DNS, TLS, firewall, proxy, host resources, or secret-store configuration;
- private service exposure, log/metric retention, alert delivery, backup schedule, or restore;
- database target history, an upgrade/rollback, or affected production rows;
- provider/webhook, radio/device, physical-field, human usability, accessibility-assistive-tech,
  capacity, or incident-recovery behavior.

## Required production gates

The owner and deployment operator must explicitly accept evidence for:

1. named responsibility and escalation contacts;
2. host/network/DNS/TLS/firewall and one-origin REST/WSS behavior;
3. secret ownership, rotation, and file/access controls;
4. daily off-host backup and a disposable restore meeting the chosen RPO/RTO;
5. migration compatibility and the rollback/recovery boundary;
6. logs, alerts, restart behavior, capacity, and a representative recovery rehearsal; and
7. device/provider/field and human acceptance appropriate to any claim being made.

The detailed server/network contract and operator commands are in
[operations/university-server-network-handoff.md](operations/university-server-network-handoff.md).
