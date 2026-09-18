#!/usr/bin/env bash
# Dumps the database pointed to by $DATABASE_URL to backup/. Requires the
# postgresql-client tools (pg_dump) — on the CI runner these are installed by
# .github/workflows/backup.yml; locally: `apt install postgresql-client`,
# `brew install libpq`, etc.
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL is not set." >&2
  exit 1
fi

mkdir -p backup
out="backup/linkedout-$(date -u +%Y%m%dT%H%M%SZ).dump"

pg_dump "$DATABASE_URL" --format=custom --no-owner --no-privileges --file="$out"

echo "Wrote $out"
