#!/usr/bin/env bash

set -euo pipefail

if [ "$#" -eq 0 ]; then
  echo "Usage: ./scripts/agy-worker.sh \"task instructions\"" >&2
  exit 1
fi

TASK="$1"

agy --print-timeout 5m --print "
You are an implementation worker operating inside this repository.

Execute only the following task:
$TASK

Rules:
- Follow existing project patterns.
- Do not redesign architecture.
- Do not add dependencies.
- Do not change unrelated files.
- Do not commit changes.
- Run formatting only on changed files.
- Report files changed and validation commands.
- Stop if the request is ambiguous.
"