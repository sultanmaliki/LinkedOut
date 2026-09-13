# Authentication Documentation

## Endpoints

- POST /auth/register
- POST /auth/login
- POST /auth/refresh

## Validation Rules

- Name must be at least 2 characters.
- Email must be a valid email address.
- Password must be at least 8 characters.

## Notes

- Passwords are hashed with bcrypt before storage.
- Tokens are signed with a shared secret (`JWT_SECRET`, falls back to a dev default) and returned to the client.
- Refresh tokens are not persisted server-side; they are verified as JWTs (`type: 'refresh'`) with no revocation list, so there is currently no way to invalidate a single refresh token before it expires.
- `schema.sql` in this directory is not used by the running application — the real schema lives in `packages/database/src/schema` (`users`, `professionalProfiles`), consumed via `@linkedout/database`.
