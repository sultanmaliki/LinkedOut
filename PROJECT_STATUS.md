# LinkedOut — Project Status

## Current Version

v0.4.0 — core product built, pre-launch hardening in progress

This file is the source of truth for "what's actually built." Update it in the same change whenever a feature, endpoint, or security control is added or changed.

---

## Built and working

### Auth & accounts

- Register / login / refresh / logout — JWT access tokens (15m) + rotating single-use refresh tokens (7d)
- Email verification — a real email is sent via Resend (`RESEND_API_KEY`); when that's unset (local dev/test default) the link is logged to the console and also returned directly in the response as `devVerificationToken`. Registration/login stay unblocked either way — an unverified account can sign in immediately — but `VerifiedEmailGuard` rejects (403) the account's attempts to create a post/comment, publish a review or company reply, post a job, create a job opportunity, or respond to an opportunity/offer until `emailVerified` is true. Clicking the link logs the user in automatically (`POST /auth/verify-email` returns a fresh access/refresh pair, same as login/register) — works even on a device that never registered, since opening a valid link is itself treated as proof of mailbox ownership.
- Forgot password (`POST /auth/forgot-password` → emailed link → `POST /auth/reset-password`) and in-profile change password (`PATCH /auth/password`, at `/me/security`). Both return a fresh session on success — resetting/changing a password logs the user in rather than requiring a separate sign-in — and both reject an all-whitespace password (`@Matches(/\S/)` alongside `MinLength(8)` on every password field, including register; `MinLength` alone is satisfied by a string of spaces). `forgot-password` always responds `{ sent: true }` whether or not the email is registered, so it can't be used to enumerate accounts. Reset tokens are single-use and rotating (`users.passwordResetTokenId`), mirroring refresh tokens.
- Account status (`ACTIVE` / `SUSPENDED` / `DEACTIVATED` / `BANNED`) enforced on every authenticated request, not just at login
- Roles: `PROFESSIONAL`, `COMPANY_ADMIN`, `MODERATOR`, `ADMIN` — admin role management UI included

### Professional profiles

- Profile CRUD (headline, bio, location, photos, personal website)
- Employment history with an employer-verification flow: professional submits company email/employee ID/ID card, a moderator approves or rejects it via the moderation queue (self-submitted, not auto-verified — confirms employment at the named company only, not that the company itself is legitimate)
- Employment expectations (compensation range, work mode, availability)
- Skills, portfolio links
- "Actively looking" toggle, used as a search filter
- Search across professionals (name/headline) and companies (name) — a `/search` page plus a header search box, both direct Postgres queries (see [docs/search.md](docs/search.md)); does not cover posts or reviews

### Companies

- Company profiles, locations, benefits, admin claim flow
- Company verification: admin submits business registration #/tax ID/document link, a moderator approves or rejects it via the moderation queue; approval syncs the company's public `verified` badge
- Job postings

### Hiring flow (the "reverse hiring" core)

- Companies send opportunities to professionals (not the other way around)
- Professionals accept/decline; acceptance requires supplying 1–10 contact methods (email/phone/LinkedIn/portfolio)
- Hiring pipeline v2 (full stack — see [docs/architecture/hiring-pipeline-v2.md](docs/architecture/hiring-pipeline-v2.md)): a 9-stage canonical pipeline (`SENT → ACCEPTED → INTERVIEW_SCHEDULED → REVIEWING → OFFER_RELEASED → OFFER_ACCEPTED`), each opportunity decorated at read time with a computed ghosting-timer status (soft flag, then an automatic outcome) instead of a background job; company-customizable response windows (defaults on the company, overridable per-send/per-offer); a private, per-side responsiveness score; a professional can manually flag a stalled company-owned stage. Frontend: a `PipelineStepper` status-bar component on both sides, a new company-wide "Opportunities" tab (with interview scheduling, move-to-review, offer release, reject, and contact-info reveal), the professional's opportunity cards show the stepper plus offer-response/flag-unresponsive actions, company hiring-settings fields on the Overview tab, private response-rate stats on both sides, and a post-offer nudge banner on the professional's employment-history page.
- Company-wide "opportunities sent" list (`GET /companies/:id/opportunities`) — previously only visible per-job
- The professional's submitted contact methods are now actually visible to the company after acceptance (`GET /opportunities/:id/contact-methods`) — this endpoint existed as dead code for a while; fixed as part of hiring pipeline v2
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
- Verification review queue (`/moderation` → Verifications tab): moderators approve/reject pending company and employment verifications; rejection requires a reason, every decision is audit-logged, and re-reviewing an already-decided item is rejected with a `409`

### Contact

- Public contact form (`POST /contact`, `/contact` page, floating contact button on every page) — persists to `contact_messages`. No admin inbox UI exists yet to view submissions; query the table directly.

### Database connections

- `DATABASE_URL` points at Supabase's **transaction-mode pooler** (port 6543), not session mode (5432) — session mode hard-rejects past its own `pool_size` (15 on the free tier) instead of queuing, and the feed page alone (2 queries per visible post, fired in parallel) was enough to exceed that under normal browsing, producing real `500`s and a client-side crash. Transaction mode multiplexes many app-side connections over far fewer real Postgres backends. Requires `prepare: false` on the `postgres.js` client (transaction-mode pooling doesn't support prepared-statement caching across queries) — see `packages/database/src/client.ts`.
- `DIRECT_DATABASE_URL` (session-mode pooler or a direct connection) is used only by `drizzle-kit push/generate/migrate` (`drizzle.config.ts`), since transaction-mode pooling can break the advisory locks and multi-statement DDL migrations rely on. Falls back to `DATABASE_URL` when unset.
- Local dev/`.env` already uses this setup. **Production's Railway `DATABASE_URL` has not been switched yet** — see Known gaps.

### Site chrome / UX polish

- Dark mode toggle (persisted to `localStorage`, no-flash on load), mobile nav, skip-to-content link, scroll progress bar, back-to-top button
- Confirmation modals on destructive actions (delete post, portfolio link, company location, attachment) — a shared `useConfirmDialog` hook
- Password visibility toggle on the auth form, copy-link buttons on professional/company profile pages
- Print stylesheet (hides chrome, forces light mode on paper), a real 404 page, route-transition loading skeleton
- Login-prompt toast (`components/login-prompt.tsx`, `useLoginPrompt()`): liking a post, commenting, or replying while logged out previously either silently no-op'd (the like button) or hid the control entirely (comments) — both read as broken to a first-time visitor. Now shows a small dismissible bottom-left toast naming the action and a button straight to `/auth`, auto-dismissing after 6s.

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
- Search via Meilisearch, caching via Valkey, file storage via MinIO — all three are provisioned in `docker-compose.yml` but have **zero application code references**. Professional/company search is plain Postgres queries (see Built above); attachment/photo fields are plain URL columns, not uploaded objects. (HTTP `Cache-Control` on public GET endpoints — see below — is separate and doesn't use Valkey.)
- Cookie consent banner, newsletter signup, UTM link tracking — no analytics or email-marketing infrastructure exists to make these meaningful; adding the UI without it would be misleading
- Event-driven/queue architecture — rejected, see [ADR-005](docs/adr/adr-005-event-driven.md) (status corrected to Rejected)
- CSRF protection, Prometheus/Grafana, Sentry — identified gaps, not yet implemented. Rate limiting (`@nestjs/throttler`) and structured logging (Pino, via `nestjs-pino`) **are** implemented — see [docs/security.md](docs/security.md) and [docs/logging-and-observability.md](docs/logging-and-observability.md).

---

## Known gaps / tracked debt

- No explicit database indexes beyond primary keys and one unique constraint (`likes_post_professional_company_idx`) — flagged, not yet fixed
- `apps/api` and `apps/web`'s `lint` scripts are placeholders (`echo`); `apps/api`'s `test` script is real
- CI applies schema via `drizzle-kit push --force`, not replayed migrations — migrations in `packages/database/drizzle/` aren't exercised by CI. (Until now, CI ran plain `drizzle-kit push` with no TTY, which prints "Interactive prompts require a TTY", never applies anything, and exits `0` anyway — the "Push database schema" step reported success while every CI run's database stayed completely empty. Every real-DB test — `auth.e2e-spec.ts`, `auth.service.spec.ts`, `auth.guard.spec.ts`, `contact.e2e-spec.ts` — was failing in CI for this reason alone; `--force` fixes it. See `.github/workflows/ci.yml`'s comment on the push step and the CHANGELOG.)
- `apps/api/dist/**` and `tsconfig.tsbuildinfo` files are committed to git despite a later `.gitignore` rule — never retroactively cleaned up
- **Production's `DATABASE_URL` on Railway still needs to be switched to Supabase's transaction-mode pooler (port 6543)** to get the fix below — this can only be done in Railway's dashboard, not from a commit. Until then, production is still exposed to the connection-exhaustion bug just fixed for local dev.

---

## History

- **Sprint 0 — Foundation:** monorepo, Turborepo, Next.js/NestJS scaffolding, Docker Compose, ADRs. Complete.
- **Sprint 1 — Domain modeling:** 33-entity schema frozen across Auth/Professional/Company/Publishing/Hiring/Reviews/Moderation domains ([schema-freeze.md](docs/architecture/schema-freeze.md)). Complete.
- **Sprint 2+ — Core API + frontend:** every domain module above built with unit + e2e tests, backend and frontend wired together. Complete.
- **Hardening:** a full architecture/security audit and a live red-team review were run against the local dev environment; every HIGH/MEDIUM finding from the red-team pass has been fixed with a regression test (see [docs/security.md](docs/security.md)).
- **Current — Site polish:** dark mode, mobile nav, cross-entity search (professionals + companies), a contact form, confirmation modals, and other UX items added (see Built above). Added a 34th schema entity (`contact_messages`).

## Next up

See [docs/roadmap.md](docs/roadmap.md). Immediate candidates: closing the known-gaps list above (indexes, real lint scripts, a real migration-based CI flow).

**Hiring pipeline v2** (ghosting prevention + private responsiveness scoring) is complete end-to-end — see Hiring flow above and [docs/architecture/hiring-pipeline-v2.md](docs/architecture/hiring-pipeline-v2.md).
