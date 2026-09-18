#!/usr/bin/env bash
# Restores a dump produced by db-backup.sh into $DATABASE_URL.
#
# DANGER: this overwrites data in the target database. Point it at a scratch
# database (a fresh local Postgres, or a throwaway Supabase project/branch)
# to test that restoration works — never at a database you care about, and
# never at production. See docs/operational-runbook.md for the recommended
# quarterly restore-test procedure.
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set." >&2
  exit 1
fi

dump="${1:-}"
if [ -z "$dump" ] || [ ! -f "$dump" ]; then
  echo "Usage: DATABASE_URL=... scripts/db-restore.sh path/to/backup.dump" >&2
  exit 1
fi

read -r -p "This will overwrite data at the target DATABASE_URL. Type 'yes' to continue: " confirm
if [ "$confirm" != "yes" ]; then
  echo "Aborted."
  exit 1
fi

pg_restore "$dump" --dbname="$DATABASE_URL" --clean --if-exists --no-owner --no-privileges

echo "Restored $dump"
