# LinkedOut

LinkedOut is a reverse-hiring platform: companies discover professionals and send them opportunities, rather than professionals applying to job postings. It helps professionals evaluate employers through verified reviews, and helps companies find talent based on demonstrated skills and experience rather than resumes and cover letters.

## Project Overview

This repository is a monorepo containing:

- a Next.js web application for the user-facing experience,
- a NestJS backend API,
- a shared Drizzle/PostgreSQL database package,
- documentation covering architecture, decisions, and operational guidance,
- a Turborepo-powered workspace for build, lint, test, and typecheck orchestration.

**Current state:** the core product is built and functional end-to-end — registration/login/email verification, professional profiles (employment history, skills, portfolio, expectations), company profiles and job postings, the opportunity/hiring-pipeline flow, a posts feed with comments/likes/attachments, verified company reviews with company replies, and a moderation/admin-role system. See [PROJECT_STATUS.md](PROJECT_STATUS.md) for the detailed feature-by-feature status and [docs/roadmap.md](docs/roadmap.md) for what's next.

## Monorepo Structure

- `apps/web` — Next.js frontend application
- `apps/api` — NestJS backend service
- `packages/database` — Drizzle ORM schema, migrations, and DB client (`@linkedout/database`)
- `packages/ui`, `packages/config`, `packages/types` — empty placeholder packages, not yet in use
- `docs` — architecture notes, roadmap, decisions, and ADRs
- `configs` — shared ESLint configuration

## Technology Stack

### Frontend

- Next.js 15, React 19, TypeScript
- Tailwind-based UI components (no external component library)

### Backend

- NestJS, TypeScript
- Custom JWT authentication (access + refresh tokens, no third-party auth provider)
- `class-validator`/`class-transformer` DTOs with a global `ValidationPipe`
- Drizzle ORM over PostgreSQL

### Tooling

- pnpm workspaces + Turborepo
- Jest (real test suite for `apps/api`: 54 suites / 300+ tests)
- ESLint (only `packages/database` has a real lint script today — see [docs/coding-guidelines.md](docs/coding-guidelines.md))
- Docker Compose for local Postgres + API

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

4. Set required environment variables — copy `.env.example` to `.env` and fill in `DATABASE_URL` and `JWT_SECRET` (the API refuses to start without both; there is no insecure default fallback).

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
```

Running the API test suite through Docker (the pattern used throughout development, avoids host/container Node version drift):

```bash
docker compose run --rm api sh -c "pnpm --filter @linkedout/api test"
```

## Available Scripts

From the repository root: `pnpm build`, `pnpm lint`, `pnpm test`, `pnpm typecheck`, `pnpm format`.

Note: `apps/api` and `apps/web`'s own `lint`/`typecheck`/`test` scripts are mixed — `apps/api` has a real Jest suite but a placeholder `lint` script; `apps/web` has real `typecheck`/`build` but a placeholder `lint` script. This is tracked as known tooling debt, not fixed silently — see [docs/coding-guidelines.md](docs/coding-guidelines.md).

## Documentation

Start at [docs/README.md](docs/README.md) for the full index. Most relevant to get oriented:

- [PROJECT_STATUS.md](PROJECT_STATUS.md) — what's built, what isn't
- [docs/vision.md](docs/vision.md) — product philosophy and non-goals
- [docs/architecture.md](docs/architecture.md) — how the system is actually put together
- [docs/security.md](docs/security.md) — current security posture, known gaps
- [docs/decisions.md](docs/decisions.md) — product decision log

## Contribution Guidelines

- Keep app-specific logic inside the relevant app package; put reusable code in shared packages.
- Update tests alongside behavior changes — don't weaken or delete existing assertions to make something pass.
- **Update the relevant markdown docs in the same change whenever you add, remove, or change behavior, an endpoint, a schema column, or a security control.** Stale docs are treated as a bug, not cosmetic debt.
- See [docs/contributing.md](docs/contributing.md) and [docs/branching-and-commits.md](docs/branching-and-commits.md) for workflow conventions.
