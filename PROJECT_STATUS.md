# LinkedOut — Project Status

## Current Version

v0.3.0 — core product built, pre-launch hardening in progress

This file is the source of truth for "what's actually built." Update it in the same change whenever a feature, endpoint, or security control is added or changed.

---

## Built and working

### Auth & accounts

- Register / login / refresh / logout — JWT access tokens (15m) + rotating single-use refresh tokens (7d)
- Email verification (dev-mode: verification link/token returned in the API response instead of sent by a real provider — no email provider is wired up yet)
- Account status (`ACTIVE` / `SUSPENDED` / `DEACTIVATED` / `BANNED`) enforced on every authenticated request, not just at login
- Roles: `PROFESSIONAL`, `COMPANY_ADMIN`, `MODERATOR`, `ADMIN` — admin role management UI included

### Professional profiles

- Profile CRUD (headline, bio, location, photos, personal website)
- Employment history with company-verification flow (verify via company email)
- Employment expectations (compensation range, work mode, availability)
- Skills, portfolio links
- "Actively looking" toggle, used as a search filter
- Professional search/discovery (direct Postgres queries — see [docs/search.md](docs/search.md))

### Companies

- Company profiles, locations, benefits, admin claim flow, verification
- Job postings

### Hiring flow (the "reverse hiring" core)

- Companies send opportunities to professionals (not the other way around)
- Professionals accept/decline; acceptance requires supplying a contact method
- Hiring pipeline: append-only stage history per opportunity
- "Send opportunity" wired directly from a professional's profile page

### Posts & social

- Company- and professional-authored posts, with scheduled publish/archive
- Comments (one reply level deep), likes
- Post attachments (image/video require a post; standalone PDFs allowed)

### Reviews

- Reviews require a _verified_ employment history, and (as of this session's security fixes) the employment history's company must actually match the company being reviewed
- Company replies (one per review), review ratings by category
- Companies cannot delete or hide reviews

### Moderation & trust

- Moderation cases, moderation actions, trust flags, audit logs
- Moderator/Admin guards separate from regular authenticated access

### Security (see [docs/security.md](docs/security.md) for the full posture and a completed red-team review)

- `ValidationPipe({whitelist: true, transform: true})` globally — unexpected/server-controlled fields are stripped, not silently trusted
- Access tokens carry an explicit `type: 'access'` claim; `AuthGuard` allowlists it rather than denylisting `'refresh'`
- Refresh tokens are single-use and rotate on every login/refresh (`users.activeRefreshTokenId`); a used or superseded refresh token is rejected
- `AuthGuard` checks live account status on every request — a suspended/banned account's still-valid token is rejected immediately, not just at next login
- `JWT_SECRET` has no insecure code-level fallback; the API refuses to start without it
- A global exception filter turns invalid-UUID input into `400`s instead of unhandled `500`s

---

## Explicitly not built (and why)

These are **deliberately out of scope**, not forgotten — see [docs/vision.md](docs/vision.md) "Non-Goals" and [docs/decisions.md](docs/decisions.md):

- Internal messaging/chat — hiring continues through the company's own channels (D-004)
- Notifications (in-app, email, push, webhook) — see [docs/notifications.md](docs/notifications.md), marked deferred
- AI-assisted features (summaries, matching, moderation triage) — see [docs/ai-integration.md](docs/ai-integration.md), marked deferred
- Search via Meilisearch, caching via Valkey, file storage via MinIO — all three are provisioned in `docker-compose.yml` but have **zero application code references**. Search is plain Postgres queries; there's no caching layer; attachment/photo fields are plain URL columns, not uploaded objects.
- Event-driven/queue architecture — rejected, see [ADR-005](docs/adr/adr-005-event-driven.md) (status corrected to Rejected)
- Rate limiting, CSRF protection, real observability stack (Sentry/Prometheus/Grafana) — identified gaps, not yet implemented

---

## Known gaps / tracked debt

- No explicit database indexes beyond primary keys and one unique constraint (`likes_post_professional_company_idx`) — flagged, not yet fixed
- `apps/api` and `apps/web`'s `lint` scripts are placeholders (`echo`); `apps/api`'s `test` script is real
- CI applies schema via `drizzle-kit push`, not replayed migrations — migrations in `packages/database/drizzle/` aren't exercised by CI
- `apps/api/dist/**` and `tsconfig.tsbuildinfo` files are committed to git despite a later `.gitignore` rule — never retroactively cleaned up
- No real email provider — verification links are returned directly in dev-mode API responses
- `hiring_pipelines.stage` is a plain `text` column written by two different vocabularies (auto lifecycle events vs. DTO-validated business stages), not a Postgres enum

---

## History

- **Sprint 0 — Foundation:** monorepo, Turborepo, Next.js/NestJS scaffolding, Docker Compose, ADRs. Complete.
- **Sprint 1 — Domain modeling:** 33-entity schema frozen across Auth/Professional/Company/Publishing/Hiring/Reviews/Moderation domains ([schema-freeze.md](docs/architecture/schema-freeze.md)). Complete.
- **Sprint 2+ — Core API + frontend:** every domain module above built with unit + e2e tests, backend and frontend wired together. Complete.
- **Current — Hardening:** a full architecture/security audit and a live red-team review were run against the local dev environment; every HIGH/MEDIUM finding from the red-team pass has been fixed with a regression test (see [docs/security.md](docs/security.md)).

## Next up

See [docs/roadmap.md](docs/roadmap.md). Immediate candidates: closing the known-gaps list above (indexes, real lint scripts, a real migration-based CI flow), then a real email provider.
