# Changelog

This changelog is maintained at a feature-area level, not commit-by-commit. See git history for full detail.

## Unreleased — CI

### Fixed

- CI's "Push database schema" step ran plain `drizzle-kit push`, which needs an interactive confirmation this schema has no TTY for in CI; it printed "Interactive prompts require a TTY", never applied anything, and — critically — exited `0` anyway, so the step reported success while the database stayed completely empty on every run. Every test that touches a real DB connection (`auth.e2e-spec.ts`, `auth.service.spec.ts`, `contact.e2e-spec.ts`, and `auth.guard.spec.ts` below) was failing in CI for this reason alone. Fixed by adding `--force` to the CI-only push command (safe there since the database is a disposable container recreated every run; never use it against a real database).
- `auth.guard.spec.ts` signed its test JWTs with the hardcoded literal `'dev-secret'` instead of the actual configured secret — a leftover from before `getJwtSecret()` replaced that value as a fallback (see `jwt-secret.ts`'s own comment on why the fallback was removed). It only passed by coincidence locally, where `docker-compose.yml` happens to set `JWT_SECRET=dev-secret`; CI uses a different value, so every guard test failed with "Invalid access token" regardless of what it was actually testing. Fixed by signing with `getJwtSecret()` directly.

## Unreleased — Site polish

### Added

- Hiring pipeline v2, full stack (ghosting prevention + private responsiveness scoring — see [docs/architecture/hiring-pipeline-v2.md](docs/architecture/hiring-pipeline-v2.md), decision [D-021](docs/decisions.md)): `hiring_pipelines.stage` is now a real 9-value enum (was free text with a mixed vocabulary); every opportunity response is decorated with a computed, never-stored `displayStatus` reflecting a two-tier timer (soft flag, then an automatic outcome) with no scheduler involved; company-customizable response windows (`companies.default_response_window_days`/`default_offer_window_days`, per-send/per-offer overrides); new `GET /companies/:id/opportunities` (company-wide sent-opportunities list, previously only visible per-job); new `GET /opportunities/:id/contact-methods` (fixes a pre-existing dead-code bug — companies previously had no way to see a professional's contact info after acceptance, despite the UI promising it); new `POST .../respond-to-offer` and `POST .../flag-unresponsive`; private `GET /professionals/me/responsiveness` and `GET /companies/:id/responsiveness`. Frontend: a shared `PipelineStepper` status-bar component (perspective-aware copy for company vs. professional); a new company "Opportunities" tab aggregating every sent opportunity with inline stage-advance forms (interview date, offer window) and a reject action; the professional's opportunity cards gained offer-response and flag-unresponsive actions; company hiring-settings fields on the Overview tab; private response-rate stats on both sides; a post-offer-acceptance nudge banner on the professional's employment-history page prompting a profile update
- Verification review queue: `GET/PATCH /moderation/verifications/companies/:id` and `GET/PATCH /moderation/verifications/professionals/:id`, plus a "Verifications" tab on `/moderation`. Company and employment verification were previously self-submit-only with no approval path — every submission stayed `PENDING` forever; moderators can now approve or reject each one (rejection requires a reason), approval syncs the company's public `verified` badge, and every decision is audit-logged
- Dark mode toggle (persisted, no-flash on load), mobile navigation, skip-to-content link, scroll progress bar, back-to-top button
- Cross-entity search: `/search` page and header search box, covering professionals (name/headline) and companies (name) — new `q` filter on both `GET /professionals` and `GET /companies`
- Contact form: `POST /contact` (public), `/contact` page, floating contact button — new `contact_messages` table (34th schema entity); no admin inbox UI yet
- Confirmation modals on destructive actions (delete post, portfolio link, company location, attachment), replacing an inline two-click pattern in two places and adding real confirmation where there was none in three others
- Password visibility toggle, copy-profile/company-link buttons, print stylesheet for profile pages, a real 404 page, route-transition loading skeleton, FAQ section on the homepage
- Last-edited date shown on posts that have been updated since creation

### Fixed

- `turbo.json`'s `test` task was missing `JWT_SECRET` from its env allowlist, so CI's `pnpm test` failed even though the workflow set it — see [security.md](docs/security.md) history
- A migration applied by hand earlier in this project's history was never recorded in Drizzle's migration-tracking table, so `drizzle-kit migrate` failed on every fresh container start; backfilled the tracking rows
- `contact_methods.professional_response_id` had a stray `.unique()` constraint, limiting each opportunity acceptance to exactly one contact method even though the DTO and UI both support up to 10 — accepting an opportunity with more than one contact method (e.g. email + phone) always failed with an unlogged `500`. Dropped the constraint (`drizzle/0004_drop_contact_method_unique.sql`); also added `Logger.error` to `PostgresExceptionFilter`'s catch-all branch, which previously swallowed every unhandled exception with zero server-side logging — this is what made the bug invisible in the first place
- `Skills` section on `/me/skills`: proficiency/years fields used fixed pixel widths (`w-28`/`w-24`) next to a `flex-1` name field, which collapsed the name field to near-nothing on narrow viewports; each skill row is now its own labeled card with a responsive 2-column grid

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
