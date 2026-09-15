# Changelog

This changelog is maintained at a feature-area level, not commit-by-commit. See git history for full detail.

## Unreleased — Site polish

### Added

- Dark mode toggle (persisted, no-flash on load), mobile navigation, skip-to-content link, scroll progress bar, back-to-top button
- Cross-entity search: `/search` page and header search box, covering professionals (name/headline) and companies (name) — new `q` filter on both `GET /professionals` and `GET /companies`
- Contact form: `POST /contact` (public), `/contact` page, floating contact button — new `contact_messages` table (34th schema entity); no admin inbox UI yet
- Confirmation modals on destructive actions (delete post, portfolio link, company location, attachment), replacing an inline two-click pattern in two places and adding real confirmation where there was none in three others
- Password visibility toggle, copy-profile/company-link buttons, print stylesheet for profile pages, a real 404 page, route-transition loading skeleton, FAQ section on the homepage
- Last-edited date shown on posts that have been updated since creation

### Fixed

- `turbo.json`'s `test` task was missing `JWT_SECRET` from its env allowlist, so CI's `pnpm test` failed even though the workflow set it — see [security.md](docs/security.md) history
- A migration applied by hand earlier in this project's history was never recorded in Drizzle's migration-tracking table, so `drizzle-kit migrate` failed on every fresh container start; backfilled the tracking rows

## Unreleased — Security hardening

### Added

- `POST /auth/logout`, refresh token rotation (`users.activeRefreshTokenId`), single-use email verification tokens
- Global exception filter converting invalid-UUID input from `500` to `400`
- Fail-fast `JWT_SECRET` validation (no insecure default)

### Fixed

- Reviews could be posted against a company unrelated to the reviewer's actual verified employer
- Suspended/banned accounts kept working access tokens until natural expiry instead of losing access immediately
- Refresh tokens could be replayed indefinitely instead of being single-use
- Case-variant emails (`Ada@Example.com` vs `ada@example.com`) could register as separate accounts
- `AuthGuard` accepted any correctly-signed token regardless of its intended purpose (denylist instead of allowlist)

Full detail: [docs/security.md](docs/security.md).

## v0.2.0 — Core product

### Added

- Professional profiles: employment history + company-email verification, employment expectations, skills, portfolio links, "actively looking" toggle
- Company profiles: locations, benefits, admin claim flow, verification, job postings
- Hiring flow: company-initiated opportunities, accept/decline with required contact method, append-only hiring pipeline, "send opportunity" from a professional's profile
- Posts feed: company- and professional-authored posts, scheduled publish/archive, comments (one reply level), likes, attachments
- Reviews: verified-employment-gated submission, per-category ratings, one company reply per review
- Moderation: moderation cases/actions, trust flags, audit logs, admin role management UI
- Email verification (dev-mode token, no real mailer yet)

## v0.1.0 — Foundation

### Added

- Turborepo monorepo, Next.js frontend, NestJS backend
- Docker Compose local dev stack (Postgres; Valkey/MinIO/Meilisearch provisioned but unused)
- Drizzle ORM schema (33 entities, frozen design) and migrations
- ADR documentation, initial auth module (register/login/refresh)

### Known Issues (carried forward, see [PROJECT_STATUS.md](PROJECT_STATUS.md))

- Placeholder `lint`/`test` scripts in `apps/api`/`apps/web`
- No database indexes beyond primary keys and one unique constraint
- `drizzle-kit push` in CI instead of replayed migrations
