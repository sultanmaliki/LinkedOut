# Feature Set

Status legend: **Built** = implemented and tested. **Planned** = intended, not started. **Deferred** = deliberately out of scope for now (see [vision.md](vision.md) Non-Goals).

## Built

- Auth: register, login, refresh (rotating, single-use), logout, email verification (real send via Resend when `RESEND_API_KEY` is set, dev-mode console link otherwise) gating posting/applying/reviewing until verified, forgot-password (email link, same-response regardless of whether the email is registered) and an in-profile change-password form — both log the user in with a fresh session on success and reject all-whitespace passwords
- Professional profiles: employment history + verification, expectations, skills, portfolio links, "actively looking" toggle
- Search across professionals (name/headline) and companies (name), via direct Postgres queries — a `/search` page plus a header search box; no post/review search yet
- Company profiles: locations, benefits, admin claim, verification, job postings
- Reverse-hiring flow: company-initiated opportunities, accept/decline with required contact method, append-only hiring pipeline
- Posts feed: comments (one reply level), likes, attachments, scheduled publish/archive, last-edited date shown when a post has been updated
- Reviews: verified-employment-gated, per-category ratings, one company reply per review, companies cannot delete/hide
- Moderation: cases, actions, trust flags, audit logs
- Admin role management
- Contact form (`POST /contact`, public) — persists to `contact_messages`; no admin inbox UI yet, query the table directly
- Site chrome: dark mode toggle, mobile nav, skip-to-content link, scroll progress bar, back-to-top button, confirmation modals on destructive actions, password visibility toggle, copy-profile/company-link buttons, print stylesheet (profile pages), FAQ section on the homepage

## Planned

- Reputation/trust scoring built on the existing trust-flag and moderation data
- Rate limiting on authentication and public write endpoints
- Database indexes beyond primary keys/one unique constraint

## Deferred (not roadmapped)

- Notifications (in-app, email, push, webhook)
- AI-generated summaries, insights, or matching
- Search via Meilisearch (professional/company search is real, but is direct Postgres — not the search index), caching via Valkey, file storage via MinIO — all three run in Docker Compose but have no application code wiring today
- Cookie consent banner, newsletter signup, UTM tracking — no analytics/email-marketing infrastructure exists to make these meaningful yet
- Event-driven/queue architecture (see [ADR-005](adr/adr-005-event-driven.md), status: Rejected)
- Internal messaging/chat, employer analytics dashboards, third-party recruiting integrations, feature flags, multi-tenant design, SSO
