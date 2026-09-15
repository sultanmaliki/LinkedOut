# Security Architecture

This reflects the actual implementation and the outcome of a completed security audit + live red-team review, not an aspirational checklist.

## Authentication & tokens

- Custom JWT auth (see [authentication.md](authentication.md)) — no third-party provider
- Access tokens: 15 min, `type: 'access'`, allowlisted explicitly by `AuthGuard`
- Refresh tokens: 7 days, single-use and rotating (`users.activeRefreshTokenId`), invalidated by `POST /auth/logout`
- `AuthGuard` checks live account status on every request — a suspended/banned account's still-valid token is rejected immediately
- `JWT_SECRET` has no insecure fallback in code; the API refuses to start without it. `docker-compose.yml` sets a literal `dev-secret` for local dev only.
- Password hashing: bcrypt (not Argon2)

## Authorization

- `AuthGuard` → `ModeratorGuard`/`AdminGuard` stacked via `@UseGuards()`, reading `request.user.role` from the verified JWT claim
- Role changes take effect on the user's next token issuance, not instantly (role isn't re-checked against the DB on every request — only account status is)
- Ownership checks are explicit per-service (e.g. `ReviewService.requireOwnership`), not a generic policy engine

## Input validation

- `ValidationPipe({whitelist: true, transform: true})` globally strips unexpected/server-controlled fields from request bodies (confirmed via live testing — `id`, `userId`, `role` injection attempts are silently dropped, not trusted)
- `class-validator` decorators (`@IsUrl`, etc.) reject dangerous schemes like `javascript:`/`data:` in URL fields
- A global exception filter converts invalid-UUID path params / claims (Postgres error code `22P02`) into `400`s instead of unhandled `500`s

## Database

- Drizzle's parameterized query builder throughout — zero raw SQL string interpolation, confirmed via a full-repo grep. No SQL injection surface found or demonstrated.
- Reviews require a verified `EmploymentHistory`, **and the employment history's company must match the company being reviewed** (fixed after being live-demonstrated as exploitable — see Audit history below)
- No explicit indexes beyond primary keys and one unique constraint — a known, tracked gap, not a live-demonstrated vulnerability

## What's not implemented

- No rate limiting on login/register/public write endpoints — identified as a gap, never live-tested as exploited
- No CSRF protection — access/refresh tokens live in `localStorage`, not cookies, which is the standard tradeoff for this stage (XSS becomes the primary token-theft vector instead)
- No dedicated security monitoring/alerting stack (no Sentry, no Prometheus)

## Audit history

**Static audit (completed):** a full architecture/auth/database/API-security/frontend/test/dependency/CI review against the intended product direction. Findings included the hardcoded `JWT_SECRET` fallback, the review/company mismatch, an `AuthGuard` design smell (denylist instead of allowlist for token purpose), and various process/tooling gaps (placeholder lint scripts, committed `dist/`, missing indexes) — see [PROJECT_STATUS.md](../PROJECT_STATUS.md) "Known gaps" for what's still open.

**Red-team review (completed):** live attacks run against the local dev environment (not theorized) covering authentication, authorization/IDOR, input validation, token security, database security, and email-verification design. Confirmed-safe under live attack: SQL injection (inert, Drizzle parameterization holds), stored XSS (React's default escaping + zero `dangerouslySetInnerHTML` usage confirmed), server-controlled-field injection (stripped by `ValidationPipe`), cross-user/cross-company mutation attempts (blocked, `403`), opportunity-response IDOR (blocked, `404`), unauthenticated access to protected routes (`401`), duplicate-review prevention (both service-layer and DB unique constraint).

**Fixes applied, each with a regression test** (15 new tests added, 0 regressions, 303 total passing):

- HIGH — review/company mismatch (verified employment at any company let someone post a "verified" review against an unrelated one)
- HIGH — refresh token replay (no rotation, no revocation, no logout endpoint)
- HIGH — no session revocation (suspended/deleted accounts kept working tokens)
- MEDIUM — `AuthGuard` token-purpose allowlist gap
- MEDIUM — invalid UUID → `500` instead of `400`
- MEDIUM — case-sensitive email uniqueness
- MEDIUM — email verification tokens replayable after use
- MEDIUM — hardcoded `JWT_SECRET` fallback

Verdict at the time: safe to continue feature development; the three HIGH findings were blockers for any production launch and are now fixed.

## Threat model (not yet re-validated after every subsequent change — re-run the red-team process before a real launch)

- Credential stuffing / brute force — not yet rate-limited
- Token theft via XSS — bounded by short access-token TTL and single-use rotating refresh tokens, not eliminated
- Broken access control / IDOR — actively tested and found sound on the surfaces checked so far; re-test new endpoints as they're added
- Review/data integrity abuse — the specific fabrication vector found is closed; the trust model still relies on the employment-history free-text company name matching, not a real foreign key
