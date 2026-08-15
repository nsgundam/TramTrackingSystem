# Engineering Runbook

## Local setup and checks

1. Copy `env.example` to an ignored `.env` file and set local-only secrets, including
   `SEED_ADMIN_PASSWORD`, `JWT_SECRET`, `TTN_WEBHOOK_SECRET`, and the tracking-source secrets used
   by simulators.
2. Install the lockfile-defined dependencies in `shuttle-tracking-backend` and
   `shuttle-tracking-web`.
3. Use Docker Compose for the normal local stack, or follow the root [README](../README.md) for the
   manual development setup.
4. Run `bash scripts/ci-checks.sh` before requesting human review for implementation work. See
   [testing/ci-checks.md](testing/ci-checks.md) for its coverage and limits.

## Stateful local evidence

Pipeline smoke tests start services and mutate a database/Redis stack. Use only a disposable local
Compose project/volume, verify the target before running, and remove only the disposable resources
you created. Follow [testing/pipeline-smoke-tests.md](testing/pipeline-smoke-tests.md).

## Production operation

Do not use local commands, test credentials, simulators, or a repository check as permission to
operate production. The server/network handoff contains the external facts, backup/restore,
migration, restart, monitoring, incident, and acceptance requirements:

- [University server/network handoff](operations/university-server-network-handoff.md)
- [Deployment and release boundaries](deployment.md)

For an incident, preserve the incident timeline, impacted version, last successful backup, actions,
and validation. Avoid collecting credentials, payloads, raw locations, or other sensitive content
in logs or ad-hoc notes.
