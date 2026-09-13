# Authentication Module

## Scope

This module implements the authentication flow for LinkedOut: registration, login, refresh, request-level validation, service-layer logic, and a UI entry point.

## Persistence

- Backed by PostgreSQL via Drizzle ORM (`@linkedout/database`), not an in-memory store.
- `UserRepository` reads/writes the `users` table and joins `professionalProfiles` for display name.
- Registration creates a `users` row and a matching `professionalProfiles` row in a single transaction.

## Tokens

- Access tokens: JWT, 15 minute expiry.
- Refresh tokens: JWT with `type: 'refresh'`, 7 day expiry.
- Refresh tokens are stateless — verified by signature only, not persisted or checked against a revocation list. There is no session store, so a leaked refresh token cannot be revoked server-side before it expires.
