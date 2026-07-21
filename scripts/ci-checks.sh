#!/usr/bin/env bash
set -euo pipefail

repo_root="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"

echo "== Backend checks =="
npm --prefix "$repo_root/shuttle-tracking-backend" run check

echo "== Frontend checks =="
npm --prefix "$repo_root/shuttle-tracking-web" run check

echo "== Compose validation =="
docker compose --env-file "$repo_root/env.example" -f "$repo_root/docker-compose.yml" config --quiet
docker compose --env-file "$repo_root/env.example" -f "$repo_root/docker-compose.prod.yml" config --quiet

echo "== Unsafe dynamic logging check =="
if rg -n --glob '*.ts' --glob '*.tsx' \
  'console\.(log|warn|error)\([^)]*(,\s*error\b|req\.body|req\.headers|process\.env|REDIS_URL|DATABASE_URL|JWT_SECRET|TTN_WEBHOOK_SECRET|secretHash)' \
  "$repo_root/shuttle-tracking-backend/src"; then
  echo "Unsafe dynamic logging call found" >&2
  exit 1
fi

echo "All CI checks passed."
