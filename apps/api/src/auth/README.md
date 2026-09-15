# Authentication Module

See [`documentation.md`](documentation.md) in this directory for endpoints, validation rules, and token behavior. This file covers persistence.

## Persistence

- Backed by PostgreSQL via Drizzle ORM (`@linkedout/database`), not an in-memory store.
- `UserRepository` reads/writes the `users` table and joins `professionalProfiles` for display name.
- Registration creates a `users` row and a matching `professionalProfiles` row in a single transaction.
- `users.activeRefreshTokenId` stores the `jti` of the one currently-valid refresh token per user — see `documentation.md` for how rotation/single-use enforcement works.
