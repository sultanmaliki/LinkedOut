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
- Row Level Security enabled on all 35 `public` schema tables (default-deny, no policies) — defense-in-depth against a Supabase anon/service key ever leaking; harmless to the app itself since its own connection uses the `postgres` role (`rolbypassrls = true`). See Audit history below.

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

**Password-recovery review (completed, forgot-password/reset-password feature):** a diff-scoped review (identify → parallel false-positive filtering per candidate finding) of the email-verification-enforcement and password-recovery changes. Three candidates surfaced; two (a timing side-channel on `/auth/forgot-password` distinguishing registered from unregistered emails, and increased blast-radius from magic-link tokens living in URLs) were assessed as real but lower-priority (confidence 6/10 and 2/10) and left open. One was confirmed live and fixed immediately:

- **HIGH — `devResetToken`/`devVerificationToken` leaked a full account-takeover primitive in production.** `forgotPassword()`/`resendVerification()`/`register()` returned the raw password-reset or email-verification JWT directly in the HTTP response whenever `NODE_ENV !== 'production'`. Nothing in this repo's `Dockerfile` or `docker-compose.yml` ever sets `NODE_ENV=production` — that depended entirely on the hosting platform, and Railway's `NODE_ENV` was in fact unset in production at the time this was found. **Confirmed live and exploitable**: `POST /auth/forgot-password` with any registered user's email returned a valid `devResetToken` with no mailbox access required, which `POST /auth/reset-password` would accept to set a new password and return a live session — full account takeover from just an email address. Fixed in two parts: (1) Railway's `NODE_ENV` was set to `production` immediately, closing the live exposure; (2) the code was changed to gate on an explicit `ALLOW_DEV_AUTH_TOKENS=true` opt-in instead of `NODE_ENV`, so this can't silently reopen if `NODE_ENV` is ever unset again in any environment — see `apps/api/src/auth/auth.service.ts`'s `devAuthTokensEnabled` and `.env.example`.

**Checklist-based audit (completed, general security posture, not diff-scoped):** a pass against a standard AI-assisted-coding security checklist (admin routes, server-side permissions, RLS, email verification, password hashing, token storage, secrets, `.env` hygiene, log hygiene, parameterized queries, input validation, XSS, file uploads, webhook signatures, rate limiting, CORS, production debugging, dependency freshness). Most items passed on inspection (parameterized queries via Drizzle, global `ValidationPipe`, rate limiting, CORS allowlist, secrets never shipped to `apps/web`). Confirmed gaps:

- **HIGH — stored XSS via JSON-LD schema markup on public profile/company pages, fixed.** `apps/web/src/app/professionals/[id]/page.tsx` and `apps/web/src/app/companies/[id]/page.tsx` (added in the September 17 SEO work, predating this audit) built JSON-LD objects from user-controlled, only-length-limited fields (`profile.bio`/`headline`/`fullName`, `company.description`/`displayName`) and embedded them via `dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}` inside a `<script type="application/ld+json">` tag. `JSON.stringify` does not escape `</`, so a bio/description containing the literal string `</script><script>...</script>` broke out of the JSON-LD tag and executed for every unauthenticated visitor to that public page. **Live-verified**: set a profile bio to a `</script><script>window.__xss_fired=true</script>` payload, confirmed it executed before the fix and rendered as inert escaped text (each `<` replaced with its unicode escape) after. This combined badly with access/refresh tokens living in `localStorage` (see "What's not implemented" above) — full session-theft-by-visiting-a-profile chain. Fixed by adding `apps/web/src/lib/json-ld.ts`'s `toJsonLd()` (replaces every `<` with its unicode escape before embedding) and using it at all three JSON-LD call sites, including the static one in `layout.tsx` for defense-in-depth.
- **ERROR (Supabase linter) — Row Level Security disabled on all 35 `public` schema tables, fixed.** Included `users` (holds `password_hash`); flagged `EXTERNAL`-facing by Supabase's own security advisor. Mitigating factor at the time: no Supabase anon/service key is ever shipped to `apps/web` (confirmed via repo-wide grep for `NEXT_PUBLIC_SUPABASE_*`/`supabase-js`) — the app talks to Postgres only through its own NestJS API, not client-side PostgREST — so the standard "leaked anon key + no RLS" path wasn't directly wired up. Still worth closing as a backstop against a key ever leaking through any other means. Verified before enabling that this was safe: `select rolname, rolbypassrls from pg_roles where rolname = 'postgres'` confirmed the API's own connection role has `rolbypassrls = true`, so RLS can only ever restrict _other_ roles (`anon`/`authenticated`, which this app never uses) — never the app itself. Fixed by running `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` on all 35 tables (no policies needed, since default-deny-for-non-bypassing-roles is exactly the desired state). Re-ran the linter (`rls_disabled_in_public` gone, replaced by the expected informational `rls_enabled_no_policy`) and confirmed production still serves real reads (`GET /posts`, `GET /companies`) with `200`s post-change.
- **MEDIUM — log-hygiene gaps, fixed.** Two related issues surfaced under "keep sensitive data out of logs": (1) pino's `redact.paths` (`app.module.ts`) covered `password`/`token`/`refreshToken`/`accessToken` but not the `newPassword`/`currentPassword` fields this session's reset/change-password DTOs introduced — currently inert since no custom pino serializer puts `req.body` on the log line at all, but a hole in the safety net if that's ever added. Fixed by adding both fields to the redact list. (2) `MailerService`'s dev-mode fallback (used whenever `RESEND_API_KEY` is unset) logged the recipient's real email address plus the raw, live verification/reset token in plaintext, unconditionally — the same class of exposure as the `devResetToken` finding above, just written to server logs instead of the HTTP response. Fixed by gating that log line on the same `ALLOW_DEV_AUTH_TOKENS=true` opt-in as `devVerificationToken`/`devResetToken`; without it, the mailer now logs only a generic "not sent, no mailer configured" warning with no email or token in it.
- **Accepted, not fixed — access/refresh tokens in `localStorage`.** Pre-existing, already documented above under "What's not implemented" as a deliberate tradeoff. Noted here because it's what turns any future XSS into full session theft, as demonstrated by the XSS finding above. Deliberately deferred: fixing it means adding CSRF protection and reworking cross-origin cookie config between `api.raifkarani.in` and `linkedout.raifkarani.in`, a bigger project than a patch.

## Threat model (not yet re-validated after every subsequent change — re-run the red-team process before a real launch)

- Credential stuffing / brute force — rate-limited (`@nestjs/throttler`: 5/min on register+login, global default 120/min/IP elsewhere) since [auth.controller.ts](../apps/api/src/auth/auth.controller.ts); not re-validated with a live attack simulation
- Token theft via XSS — bounded by short access-token TTL and single-use rotating refresh tokens, not eliminated
- Broken access control / IDOR — actively tested and found sound on the surfaces checked so far; re-test new endpoints as they're added
- Review/data integrity abuse — the specific fabrication vector found is closed; the trust model still relies on the employment-history free-text company name matching, not a real foreign key
