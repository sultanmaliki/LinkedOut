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

- Tokens are signed with a shared secret and returned to the client.
- Refresh tokens are not persisted in this skeleton implementation; they are represented as JWTs for the auth flow.
