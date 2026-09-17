# Roles and Authorization

## Roles (actual `userRoleEnum` values)

- `PROFESSIONAL` — default role on registration. Manages their own profile, employment history, posts, and reviews (subject to verified-employment gating).
- `COMPANY_ADMIN` — manages a company they've claimed/been added to: profile, locations, benefits, jobs, opportunities, review replies.
- `MODERATOR` — access to moderation cases, actions, trust flags, audit logs, and the company/employment verification review queue via `ModeratorGuard`.
- `ADMIN` — everything `MODERATOR` can do, plus role management (`PATCH /users/:id/role`) via `AdminGuard`.

There is no `super_admin`, `company_rep`, or `anonymous`-as-a-role concept — unauthenticated requests simply have no `request.user` and hit `AuthGuard`'s `401` before any role check runs.

## Enforcement

- `AuthGuard` resolves `request.user` (`id`, `email`, `role`) from the verified access token
- `ModeratorGuard`/`AdminGuard` stack on top via `@UseGuards(AuthGuard, ModeratorGuard)` etc., checking `request.user.role`
- Resource ownership is checked explicitly per-service where it matters (e.g. a review's owning profile, a company's admin list) — there's no generic policy/permission-string system (`reviews:edit:own` etc. was an earlier design sketch, not what's implemented)
- Role changes take effect on the user's next token issuance, since the role is read from the JWT claim, not re-queried from the database on every request

## Not implemented

- Fine-grained permission strings/policies — role-level checks only
- Audit logging of role changes is not yet wired into every role-change path — verify before relying on it for compliance
