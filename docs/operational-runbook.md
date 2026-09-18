# Operational Runbook

> **Status: partially implemented.** A health-check endpoint and a nightly backup workflow exist (see below). Incident-response tooling, cache/search/object-storage health checks, and a deployed status page are still not implemented — see [deployment.md](deployment.md) and [PROJECT_STATUS.md](../PROJECT_STATUS.md).

## Service Health Checks

- `GET /health` on the API (`apps/api/src/health`) — runs `select 1` against
  Postgres and returns 200/`{status:"ok"}` or 503/`{status:"error"}`. Point an
  uptime monitor (UptimeRobot, Better Stack, etc. — pick one and configure it
  outside this repo) at this URL.
- Cache (Valkey), object storage (MinIO), and search (Meilisearch) health are
  not checked — the API doesn't use any of them yet (see PROJECT_STATUS.md).

## Incident Response

1. Triage the incident and identify blast radius.
2. Pause risky changes or roll back the latest deployment if necessary.
3. Mitigate user impact with feature flags or traffic routing.
4. Communicate status internally and externally if needed.
5. Document the incident and improve guardrails.

## Backup and Recovery

The Postgres database is hosted on Supabase. **The org is on the free plan,
which includes no automatic backups or point-in-time recovery** — confirmed
via the Supabase dashboard/API (`get_organization` → `"plan":"free"`). Until
the plan is upgraded (a paid decision), backups are handled by:

- `.github/workflows/backup.yml` — nightly (03:00 UTC) `pg_dump` of the
  database, uploaded as a 30-day GitHub Actions artifact. Requires a
  `DATABASE_URL` repository secret to be configured. Can also be triggered
  manually from the Actions tab (`workflow_dispatch`).
- `scripts/db-backup.sh` / `scripts/db-restore.sh` — the same dump/restore
  logic for local/manual use. `db-restore.sh` refuses to run without typing
  `yes`, since it overwrites the target database.

**Restore procedure (test at least quarterly):**

1. Download a recent backup artifact from the Actions tab, or run
   `scripts/db-backup.sh` locally against the current `DATABASE_URL`.
2. Point `DATABASE_URL` at a **scratch** database only — a local Postgres, or
   a disposable Supabase project/branch. Never a database with real data.
3. Run `scripts/db-restore.sh path/to/backup.dump` against that scratch
   database and spot-check a few tables/row counts against the source.
4. Note how long the dump + restore took, and whether anything failed.

Upgrading to Supabase Pro (or higher) replaces the manual workflow above with
managed daily backups and, on higher tiers, point-in-time recovery — worth
revisiting once this project has real user data at stake.

- Object storage versioning: not applicable — no object storage is in use
  (MinIO is provisioned but unused; see PROJECT_STATUS.md).
- Runbooks reviewed after major architecture changes.
