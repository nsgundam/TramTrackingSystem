#!/usr/bin/env bash

set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: ./scripts/agy-worker.sh docs/tasks/<task-id>-<topic>.md" >&2
  exit 1
fi

repo_root="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
task_spec="$1"

case "$task_spec" in
  docs/tasks/T[0-9]*-*.md) ;;
  *)
    echo "Task spec must match docs/tasks/T<number>-<topic>.md." >&2
    exit 1
    ;;
esac

case "$task_spec" in
  *..*|/*)
    echo "Task spec path must not be absolute or contain '..'." >&2
    exit 1
    ;;
esac

if [ ! -f "$repo_root/$task_spec" ]; then
  echo "Task spec not found: $task_spec" >&2
  exit 1
fi

allowed_paths="$({
  sed -n '/^## Allowed Writes$/,/^## /p' "$repo_root/$task_spec" |
    sed -n 's/^- `\([^`][^`]*\)`$/\1/p'
} | sort -u)"

if [ -z "$allowed_paths" ]; then
  echo "Task spec has no exact paths under '## Allowed Writes'." >&2
  exit 1
fi

while IFS= read -r allowed_path; do
  case "$allowed_path" in
    /*|*..*|*'*'*|*'?'*|*'['*|*/)
      echo "Allowed Writes must contain exact repository-relative file paths: $allowed_path" >&2
      exit 1
      ;;
  esac
done <<EOF
$allowed_paths
EOF

temp_root="$(mktemp -d "${TMPDIR:-/tmp}/tram-agy-worker.XXXXXX")"
worker_root="$temp_root/worktree"
patch_file="$temp_root/worker.patch"
base_commit="$(git -C "$repo_root" rev-parse HEAD)"

cleanup() {
  if [ -d "$worker_root" ]; then
    git -C "$repo_root" worktree remove --force "$worker_root" >/dev/null 2>&1 || true
  fi
  rm -rf "$temp_root"
}
trap cleanup EXIT INT TERM

git -C "$repo_root" worktree add --detach "$worker_root" "$base_commit" >/dev/null
mkdir -p "$worker_root/$(dirname -- "$task_spec")"
cp "$repo_root/$task_spec" "$worker_root/$task_spec"

(
  cd "$worker_root"
  agy --sandbox --mode accept-edits --print-timeout 5m --print "
You are an implementation worker operating in an isolated Git worktree.

Read and implement exactly: $task_spec

Rules:
- Write only exact paths listed under Allowed Writes.
- Treat every other path as read-only, including the task specification.
- Follow existing project patterns and approved decisions.
- Do not redesign architecture, add dependencies, commit, or modify Git configuration.
- Run formatting only on changed files.
- Stop on ambiguity or when another write path is required.
- Report files changed and validation commands.
"
)

# The copied task specification is input context, never worker output.
if git -C "$worker_root" cat-file -e "$base_commit:$task_spec" 2>/dev/null; then
  git -C "$worker_root" restore --source="$base_commit" -- "$task_spec"
else
  rm -f "$worker_root/$task_spec"
fi

if [ "$(git -C "$worker_root" rev-parse HEAD)" != "$base_commit" ]; then
  echo "Worker created a commit; no changes were imported." >&2
  exit 1
fi

changed_paths="$({
  git -C "$worker_root" diff --name-only HEAD --
  git -C "$worker_root" ls-files --others --exclude-standard
} | sort -u)"

if [ -z "$changed_paths" ]; then
  echo "Worker produced no changes."
  exit 0
fi

is_allowed() {
  candidate="$1"
  while IFS= read -r allowed_path; do
    if [ "$candidate" = "$allowed_path" ]; then
      return 0
    fi
  done <<EOF
$allowed_paths
EOF
  return 1
}

scope_breach=0
while IFS= read -r changed_path; do
  if ! is_allowed "$changed_path"; then
    echo "Scope breach: worker changed unauthorized path: $changed_path" >&2
    scope_breach=1
  fi
done <<EOF
$changed_paths
EOF

if [ "$scope_breach" -ne 0 ]; then
  echo "No worker changes were imported; the user's worktree was left untouched." >&2
  exit 1
fi

# Do not overwrite a tracked or untracked user change at an allowed path.
while IFS= read -r changed_path; do
  if git -C "$repo_root" ls-files --error-unmatch -- "$changed_path" >/dev/null 2>&1; then
    if ! git -C "$repo_root" diff --quiet HEAD -- "$changed_path"; then
      echo "Import blocked by a pre-existing user change: $changed_path" >&2
      exit 1
    fi
  elif [ -e "$repo_root/$changed_path" ]; then
    echo "Import blocked by a pre-existing untracked path: $changed_path" >&2
    exit 1
  fi
done <<EOF
$changed_paths
EOF

git -C "$worker_root" add -N -- .
git -C "$worker_root" diff --binary --no-ext-diff "$base_commit" -- >"$patch_file"

git -C "$repo_root" apply --check "$patch_file"
git -C "$repo_root" apply "$patch_file"

echo "Imported validated worker patch:"
printf '%s\n' "$changed_paths"
