// Every JWT-signing/verifying call site must go through this helper instead
// of reading process.env.JWT_SECRET directly. Previously the code fell back
// to a hardcoded 'dev-secret' literal whenever the env var was unset, so a
// deployment that forgot to configure JWT_SECRET would silently run with a
// well-known, publicly-committed secret (it's also hardcoded in
// docker-compose.yml for local dev) instead of failing to start.
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET is not configured');
  }

  return secret;
}
