# Feature Set

Status legend: **Built** = implemented and tested. **Planned** = intended, not started. **Deferred** = deliberately out of scope for now (see [vision.md](vision.md) Non-Goals).

## Built

- Auth: register, login, refresh (rotating, single-use), logout, email verification (dev-mode token)
- Professional profiles: employment history + verification, expectations, skills, portfolio links, "actively looking" toggle
- Professional search/discovery (direct Postgres queries)
- Company profiles: locations, benefits, admin claim, verification, job postings
- Reverse-hiring flow: company-initiated opportunities, accept/decline with required contact method, append-only hiring pipeline
- Posts feed: comments (one reply level), likes, attachments, scheduled publish/archive
- Reviews: verified-employment-gated, per-category ratings, one company reply per review, companies cannot delete/hide
- Moderation: cases, actions, trust flags, audit logs
- Admin role management

## Planned

- Reputation/trust scoring built on the existing trust-flag and moderation data
- Rate limiting on authentication and public write endpoints
- Real email provider (currently dev-mode-only)
- Database indexes beyond primary keys/one unique constraint

## Deferred (not roadmapped)

- Notifications (in-app, email, push, webhook)
- AI-generated summaries, insights, or matching
- Search via Meilisearch, caching via Valkey, file storage via MinIO — all three run in Docker Compose but have no application code wiring today
- Event-driven/queue architecture (see [ADR-005](adr/adr-005-event-driven.md), status: Rejected)
- Internal messaging/chat, employer analytics dashboards, third-party recruiting integrations, feature flags, multi-tenant design, SSO
