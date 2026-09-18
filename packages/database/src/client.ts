import 'dotenv/config';

import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not configured');
}

// Without an explicit cap, postgres.js opens a new connection per burst of
// concurrent queries. Supabase's pooler in session mode hard-rejects past
// its own pool_size (15 on the free tier) with "EMAXCONNSESSION" instead of
// queuing — verified under load-tests/browse.js, where >15 concurrent
// requests produced real 500s. Staying under that ceiling here means the
// app queues excess queries itself instead of the DB connection dying.
const MAX_CONNECTIONS = Number(process.env.DATABASE_MAX_CONNECTIONS ?? 10);

export const client = postgres(connectionString, {
  max: MAX_CONNECTIONS,
  idle_timeout: 20,
});
