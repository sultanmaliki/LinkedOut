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

- No CSRF protection — access/refresh tokens live in `localStorage`, not cookies, which is the standard tradeoff for this stage (XSS becomes the primary token-theft vector instead)
- No dedicated security monitoring/alerting stack (no Sentry, no Prometheus) — structured Pino logging exists (see [logging-and-observability.md](logging-and-observability.md)), but nothing aggregates or alerts on it yet

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

**Follow-up audit (completed, hiring-pipeline-v2 + moderator verification queue):** a full guard-coverage pass over every controller in `apps/api/src` (all 37), plus a targeted authorization review of every new endpoint added with these two features, SQL-injection surface, hardcoded-secret, path-traversal/SSRF, `ValidationPipe` field-coverage, and unscoped-UPDATE/DELETE checks. Confirmed safe: all 37 controllers guard correctly (every unguarded route is an intentionally public one); every new endpoint's authorization was traced past the `@UseGuards` decorator into the actual service-layer ownership check (`isAdmin`/`professionalProfileId` comparison), not just "is logged in"; zero raw-SQL interpolation found; zero new hardcoded secrets; zero filesystem/outbound-HTTP surface exists in the API at all; every new DTO field carries a `class-validator` decorator; every `.update()`/`.delete()` call site has a `.where()`.

- MEDIUM — a company admin could call `POST /opportunities/:id/pipeline` with `{"stage":"OFFER_ACCEPTED"}` directly, fabricating the professional's own offer-acceptance without their consent or contact methods. `OFFER_ACCEPTED` is meant to be written only by `OpportunityService.respondToOffer` in response to the professional's explicit action, mirroring `SENT`/`ACCEPTED`/`DECLINED`/`WITHDRAWN` — it was mistakenly left in the company-appendable `HIRING_PIPELINE_STAGES` set. Fixed by removing it from that set (`hiring-pipeline.repository.ts`); the DTO's `@IsIn` now rejects it with a `400`, live-verified against a real forgery attempt, with a permanent regression test asserting the DTO validation layer rejects it.

Known, accepted gap (not a vulnerability): `HiringPipelineService.appendStage` doesn't enforce stage-transition order — a company admin can jump from `ACCEPTED` straight to `OFFER_RELEASED`, skipping `INTERVIEW_SCHEDULED`/`REVIEWING`. This is a deliberate flexibility choice (a company that already knows a candidate shouldn't be forced through a formal interview step), not an authorization gap — the caller is still confined to their own company's opportunities either way.

## Threat model (not yet re-validated after every subsequent change — re-run the red-team process before a real launch)

- Credential stuffing / brute force — rate-limited (`@nestjs/throttler`: 5/min on register+login, global default 120/min/IP elsewhere) since [auth.controller.ts](../apps/api/src/auth/auth.controller.ts); not re-validated with a live attack simulation
- Token theft via XSS — bounded by short access-token TTL and single-use rotating refresh tokens, not eliminated
- Broken access control / IDOR — actively tested and found sound on the surfaces checked so far; re-test new endpoints as they're added
- Review/data integrity abuse — the specific fabrication vector found is closed; the trust model still relies on the employment-history free-text company name matching, not a real foreign key
