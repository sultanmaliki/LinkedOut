# User Flows

These match the implemented reverse-hiring model ([decisions.md](decisions.md) D-001) — professionals do not apply to jobs.

## Professional flow

1. Register, verify email, build a profile: employment history (verify via company email), expectations, skills, portfolio links.
2. Toggle "actively looking" to surface in company search/discovery.
3. Browse companies, their job postings, and verified reviews.
4. Post content (updates, achievements, publications) to the feed; comment on and like others' posts.
5. Receive opportunities companies send directly (`GET /professionals/me/opportunities`); accept (supplying a contact method) or decline.
6. After a verified employment ends, submit a review of that specific company — gated on the employment history being verified _and_ matching the company being reviewed.

## Company flow

1. Register a user account, create a company, verify it, claim/add admins.
2. Build out company profile: locations, benefits.
3. Post jobs.
4. Discover professionals through search, review their public profiles.
5. Send an opportunity for a specific job to a specific professional (`POST /jobs/:jobId/opportunities`) — this is how contact is initiated, never the reverse.
6. Track the hiring pipeline for each opportunity (append-only stage history).
7. Once a professional accepts, receive their contact method and continue hiring outside the platform.
8. Reply to reviews (one reply per review) — cannot delete or hide them.

## Moderator/Admin flow

1. Moderator reviews moderation cases and takes moderation actions; can raise trust flags on users.
2. Admin does everything a moderator can, plus manage user roles.
3. All moderation actions and role changes are intended to be auditable via `audit_logs` (see [security.md](security.md) for what's actually wired up vs. not yet).

## Not implemented

No in-app notifications exist yet — a professional or company doesn't currently get pushed a signal when an opportunity, reply, or moderation outcome happens; they have to check the relevant page. See [notifications.md](notifications.md).
