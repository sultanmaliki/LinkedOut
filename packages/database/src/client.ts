import 'dotenv/config';

import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured');
}

// DATABASE_URL must point at Supabase's *transaction-mode* pooler (port
// 6543), not session mode (5432). Session mode hard-rejects past its own
// pool_size (15 on the free tier) with "EMAXCONNSESSION" instead of queuing
// — verified under load-tests/browse.js and live, where a feed page's fan-out
// (2 queries per visible post, run in parallel) alone exceeded 15 concurrent
// connections and produced real 500s. Transaction mode multiplexes many
// client-side connections over far fewer actual Postgres backends, raising
// that ceiling well past what a single page load needs.
//
// Transaction-mode pooling doesn't support session-level features, so
// `prepare: false` is required -- postgres.js's default prepared-statement
// caching relies on a stable session, which pgbouncer/Supavisor in
// transaction mode doesn't provide (each query can land on a different
// backend connection).
const MAX_CONNECTIONS = Number(process.env.DATABASE_MAX_CONNECTIONS ?? 20);

export const client = postgres(connectionString, {
  max: MAX_CONNECTIONS,
  idle_timeout: 20,
  prepare: false,
});
