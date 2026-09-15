# Roadmap

This roadmap reflects the actual intended product direction, not a generic enterprise-SaaS template. See [docs/vision.md](vision.md) for the non-goals this deliberately excludes (messaging, AI-driven matching, notifications, microservices, event-driven architecture) — those stay out of scope unless the vision changes, not because they were deprioritized.

## Done — Core product

- Auth (register/login/refresh/logout, email verification, account status enforcement)
- Professional profiles (employment history + verification, expectations, skills, portfolio)
- Company profiles (locations, benefits, verification, admin claim)
- Hiring flow: company-initiated opportunities, accept/decline, append-only hiring pipeline
- Posts feed (comments, likes, attachments, scheduled publish/archive)
- Reviews gated on verified employment, with company replies
- Moderation (cases, actions, trust flags, audit logs) and admin role management
- A completed security audit + red-team review, with every HIGH/MEDIUM finding fixed and regression-tested

## Now — Pre-launch hardening

- Close the known-gaps list in [PROJECT_STATUS.md](../PROJECT_STATUS.md): database indexes, real `lint`/`test` scripts across all packages, migration-based CI instead of `drizzle-kit push`
- Real email provider (currently dev-mode-only verification tokens)
- Rate limiting on authentication and public write endpoints (identified gap, not yet demonstrated as exploited)

## Next — Trust & polish

- Reputation/trust signals building on the existing `trust_flags`/moderation tables
- Deeper professional search and discovery filters
- Company review moderation workflow refinements

## Deliberately not planned

Anything requiring messaging/chat, notifications, AI-driven features, an event bus/queue, microservices, or multi-region/enterprise-SSO infrastructure. If one of these becomes genuinely necessary, it needs its own ADR and an explicit decision entry in [decisions.md](decisions.md) first — not a roadmap line item.
