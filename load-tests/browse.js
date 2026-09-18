#!/usr/bin/env node
/**
 * Simulates many simultaneous visitors browsing the public, unauthenticated
 * parts of the API (company/professional listings and detail pages) — the
 * traffic pattern real users generate just by loading pages. Point this at
 * a local or staging API; never at production without explicit sign-off,
 * since sustained concurrent load is exactly what this script is for.
 *
 * Usage:
 *   BASE_URL=http://localhost:3001 node load-tests/browse.js
 *   BASE_URL=http://localhost:3001 CONNECTIONS=50 DURATION=30 node load-tests/browse.js
 */
const autocannon = require('autocannon');

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3001';
const CONNECTIONS = Number(process.env.CONNECTIONS ?? 20);
const DURATION = Number(process.env.DURATION ?? 15);

async function main() {
  // Seed IDs are fixed: run scripts/seed against the target DB first, or
  // override via env vars if the target has different data.
  const companyId = process.env.SEED_COMPANY_ID ?? '00000000-0000-4000-8000-000000000003';

  const result = await autocannon({
    url: BASE_URL,
    connections: CONNECTIONS,
    duration: DURATION,
    requests: [
      { method: 'GET', path: '/companies' },
      { method: 'GET', path: `/companies/${companyId}` },
      { method: 'GET', path: `/companies/${companyId}/reviews` },
      { method: 'GET', path: '/professionals' },
      { method: 'GET', path: '/health' },
    ],
  });

  autocannon.printResult(result, { outputStream: process.stdout });

  const failed = result.non2xx + result.errors + result.timeouts;
  if (failed > 0) {
    console.error(`\n${failed} non-2xx/errored/timed-out requests — see breakdown above.`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
