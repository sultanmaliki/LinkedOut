<p align="center">
  <img src="apps/web/src/app/opengraph-image.png" alt="LinkedOut" width="600">
</p>

<h1 align="center">LinkedOut</h1>

<p align="center">A reverse-hiring platform — companies apply to talk to you, not the other way around.</p>

<p align="center">
  <a href="https://github.com/sultanmaliki/LinkedOut/actions/workflows/ci.yml"><img src="https://github.com/sultanmaliki/LinkedOut/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <img src="https://img.shields.io/badge/node-20%2B-brightgreen" alt="Node 20+">
  <img src="https://img.shields.io/badge/pnpm-workspaces-orange" alt="pnpm workspaces">
  <img src="https://img.shields.io/badge/status-pre--launch%20hardening-yellow" alt="Status">
</p>

<p align="center">
  <a href="https://linkedout.raifkarani.in">linkedout.raifkarani.in</a> ·
  <a href="https://api.raifkarani.in/health">API health</a>
</p>

---

## What is LinkedOut?

Most hiring platforms have professionals blast out applications into the void. LinkedOut flips it: **companies discover professionals and send them opportunities**, not the other way around. Professionals build a verified profile once — employment history, skills, portfolio, compensation expectations — and evaluate companies through verified reviews before ever talking to them.

Two ideas the product is built around:

- **Verification over self-reporting.** Employment history is verified by a moderator (company email/employee ID/ID card), company profiles are verified (business registration/tax ID), and reviews require a verified employment history at the company being reviewed. Badges mean something.
- **Ghosting is measured, not just complained about.** Every hiring-pipeline stage has a company-customizable response window. A stalled stage is flagged, then auto-resolved if it stays stalled — feeding a private, per-side responsiveness score (professional and company each see only their own, and only once they clear a minimum sample size). See [docs/architecture/hiring-pipeline-v2.md](docs/architecture/hiring-pipeline-v2.md) for the full design.

**Current state:** the core product is built and functional end-to-end — auth with real email verification and password recovery, professional and company profiles, verified reviews with company replies, the reverse-hiring pipeline with ghosting prevention, a posts feed with comments/likes/attachments, and a moderation/admin system. See [PROJECT_STATUS.md](PROJECT_STATUS.md) for the detailed feature-by-feature status and [docs/roadmap.md](docs/roadmap.md) for what's next.

## Features

- **Auth** — register/login/refresh/logout (JWT access + rotating single-use refresh tokens), email verification via Resend (sensitive actions like posting, reviewing, and applying are gated on it, login isn't), forgot-password/reset-password by email link, in-profile change password, account status enforcement (active/suspended/deactivated/banned) checked on every request.
- **Professional profiles** — employment history with moderator-verified employer proof, compensation/work-mode/availability expectations, skills, portfolio links, an "actively looking" toggle used as a search filter.
- **Companies** — verified company profiles (business registration/tax ID reviewed by a moderator), locations, benefits, job postings, an admin claim flow.
- **Reverse hiring pipeline** — companies send opportunities directly; professionals accept/decline and supply contact methods on acceptance; a 9-stage pipeline (`SENT → ACCEPTED → INTERVIEW_SCHEDULED → REVIEWING → OFFER_RELEASED → OFFER_ACCEPTED`) with computed (not cron-based) ghosting timers, customizable response windows, and private responsiveness scores on both sides.
- **Posts & social** — company/professional posts with scheduled publish/archive, comments (one reply level deep), likes, image/video/PDF attachments.
- **Verified reviews** — reviews require a verified employment history at the company being reviewed, category ratings, one company reply per review; companies can't delete or hide reviews.
- **Moderation & trust** — a moderation queue for verification requests, moderation cases/actions/audit logs, separate moderator/admin guards.
- **Search** — cross-entity search over professionals and companies (direct Postgres queries — see [docs/search.md](docs/search.md)).
- **Site polish** — dark mode (no-flash), mobile nav, confirmation modals on destructive actions, a login-prompt toast instead of silently broken buttons for guests, a real 404 page, print stylesheet, SEO metadata/sitemap/Open Graph images.

## Monorepo Structure

```
apps/
  web/                Next.js 15 + React 19 frontend
  api/                NestJS backend service
packages/
  database/           Drizzle ORM schema, migrations, DB client (@linkedout/database)
  ui/ config/ types/   placeholder packages, not yet in use
docs/                  architecture notes, ADRs, roadmap, security posture
configs/               shared ESLint configuration
load-tests/            autocannon-based load test scripts
```

## Technology Stack

**Frontend** — Next.js 15 (App Router), React 19, TypeScript, Tailwind-based UI components (no external component library).

**Backend** — NestJS, TypeScript, custom JWT auth (no third-party auth provider), `class-validator`/`class-transformer` DTOs behind a global `ValidationPipe`, Drizzle ORM over PostgreSQL, [Resend](https://resend.com) for transactional email, `@nestjs/throttler` for rate limiting, `nestjs-pino` for structured logging.

**Data** — PostgreSQL via [Supabase](https://supabase.com) (transaction-mode connection pooling in production, Row Level Security enabled on every table as defense-in-depth), Drizzle migrations.

**Infra** — pnpm workspaces + Turborepo, Docker Compose for local Postgres/API, GitHub Actions CI, deployed on Railway (API) and Cloudflare (frontend).

Provisioned but **not currently used by any application code**: Valkey (Redis), MinIO (object storage), Meilisearch (search) — they run in `docker-compose.yml` but nothing reads or writes to them yet. Don't assume they're wired up.

## Prerequisites

- Node.js 20+
- pnpm
- Docker Desktop or a compatible Docker engine

## Local Development Setup

1. Install dependencies

   ```bash
   pnpm install
   ```

2. Start Postgres (and the API, if you want it containerized)

   ```bash
   docker compose up -d postgres api
   ```

3. Apply the database schema

   ```bash
   pnpm --filter @linkedout/database push
   ```

4. Set required environment variables — copy `.env.example` to `.env` and fill in at least `DATABASE_URL` and `JWT_SECRET` (the API refuses to start without both; there is no insecure default fallback). See [Environment Variables](#environment-variables) below for everything else.

5. Start development

   ```bash
   pnpm dev
   ```

### Useful development commands

```bash
pnpm --filter @linkedout/api dev      # backend in watch mode
pnpm --filter @linkedout/web dev      # frontend in watch mode
pnpm build                            # build the whole monorepo
pnpm test                             # run tests across the workspace
pnpm typecheck                        # typecheck across the workspace
pnpm format                           # prettier --write .
```

Running the API test suite through Docker (the pattern used throughout development, avoids host/container Node version drift):

```bash
docker compose run --rm api sh -c "pnpm --filter @linkedout/api test"
```

## Environment Variables

Full reference lives in [.env.example](.env.example). The essentials:

| Variable                               | Required | Purpose                                                                                                                                                                                                                 |
| -------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                         | Yes      | Postgres connection string. In production, point this at a **transaction-mode** pooler (e.g. Supabase port 6543) — session-mode pools reject past a small connection cap instead of queuing.                            |
| `JWT_SECRET`                           | Yes      | Signs access/refresh tokens. No fallback — the API won't boot without it.                                                                                                                                               |
| `DIRECT_DATABASE_URL`                  | No       | Session-mode/direct connection used only by `drizzle-kit push/generate/migrate`, since transaction-mode pooling can break the DDL/advisory-lock behavior migrations rely on. Falls back to `DATABASE_URL`.              |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | No       | Sends real verification/password-reset emails via Resend. Unset in dev = links are logged to the console instead.                                                                                                       |
| `WEB_ORIGIN`                           | No       | Frontend origin used to build links in emails. Defaults to `http://localhost:3000`.                                                                                                                                     |
| `ALLOW_DEV_AUTH_TOKENS`                | No       | Must be exactly `'true'` to take effect. Returns raw verification/reset tokens directly in API responses for local testing without a mailer. **Never enable outside local dev/CI** — see the warning in `.env.example`. |
| `RATE_LIMIT_TTL_MS` / `RATE_LIMIT_MAX` | No       | Per-IP rate limiting window/ceiling. Defaults to 120 req/60s.                                                                                                                                                           |
| `DATABASE_MAX_CONNECTIONS`             | No       | Connection pool cap on the API side. Default 20.                                                                                                                                                                        |

`VALKEY_URL`, `MEILI_HOST`/`MEILI_MASTER_KEY`, and `MINIO_*` are provisioned in Docker Compose but unused by the application today — see [Technology Stack](#technology-stack).

## Available Scripts

From the repository root: `pnpm build`, `pnpm lint`, `pnpm test`, `pnpm typecheck`, `pnpm format`, `pnpm docker:up` / `docker:down` / `docker:logs`.

Note: `apps/api` and `apps/web`'s own `lint` scripts are placeholders — `apps/api` has a real Jest suite (54+ suites, 300+ tests), `apps/web` has real `typecheck`/`build`. Tracked as known tooling debt, not fixed silently — see [docs/coding-guidelines.md](docs/coding-guidelines.md).

## Security

Auth uses short-lived JWT access tokens with rotating, single-use refresh tokens; every authenticated request re-checks live account status, not just at login. Row Level Security is enabled on every table as defense-in-depth. Sensitive actions (posting, commenting, reviewing, hiring) are gated behind email verification; unverified accounts can still log in. This project has been through an internal security-checklist audit and a live red-team pass, with fixes for every HIGH/MEDIUM finding tracked with an incident writeup — see [docs/security.md](docs/security.md) for the full posture, known gaps, and audit history.

If you find a vulnerability, please don't open a public issue — see [docs/security.md](docs/security.md) for how to report it.

## Documentation

Start at [docs/README.md](docs/README.md) for the full index. Most relevant to get oriented:

- [PROJECT_STATUS.md](PROJECT_STATUS.md) — what's built, what isn't
- [docs/vision.md](docs/vision.md) — product philosophy and non-goals
- [docs/architecture.md](docs/architecture.md) — how the system is actually put together
- [docs/architecture/hiring-pipeline-v2.md](docs/architecture/hiring-pipeline-v2.md) — the reverse-hiring pipeline and responsiveness scoring
- [docs/api.md](docs/api.md) — API reference
- [docs/security.md](docs/security.md) — current security posture, known gaps, audit history
- [docs/decisions.md](docs/decisions.md) — product decision log

## Contributing

- Keep app-specific logic inside the relevant app package; put reusable code in shared packages.
- Update tests alongside behavior changes — don't weaken or delete existing assertions to make something pass.
- **Update the relevant markdown docs in the same change whenever you add, remove, or change behavior, an endpoint, a schema column, or a security control.** Stale docs are treated as a bug, not cosmetic debt.
- See [docs/contributing.md](docs/contributing.md) and [docs/branching-and-commits.md](docs/branching-and-commits.md) for workflow conventions.

## License

No open-source license has been chosen yet. All rights reserved unless/until one is added.
