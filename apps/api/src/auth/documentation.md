# Authentication Documentation

## Endpoints

- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/logout (requires access token)
- POST /auth/verify-email
- POST /auth/resend-verification (requires access token)

## Validation Rules

- Name must be at least 2 characters.
- Email must be a valid email address (normalized to lowercase before storage/lookup).
- Password must be at least 8 characters.

## Notes

- Passwords are hashed with bcrypt before storage.
- Tokens are signed with a shared secret (`JWT_SECRET`); the API refuses to start if it is not set — there is no dev-default fallback in code.
- Access tokens carry `type: 'access'` and are the only token type `AuthGuard` accepts; refresh and email-verification tokens are rejected even though they're valid JWTs.
- Refresh tokens are single-use: `users.activeRefreshTokenId` stores the `jti` of the one currently-valid refresh token per user, rotated on every login/refresh and cleared by `POST /auth/logout`. A refresh token that has already been redeemed (or was superseded by a login/refresh elsewhere) is rejected.
- Email verification tokens are single-use: once an account is verified, any verification token for it (including the original one, replayed) is rejected.
- `schema.sql` in this directory is not used by the running application — the real schema lives in `packages/database/src/schema` (`users`, `professionalProfiles`), consumed via `@linkedout/database`.
