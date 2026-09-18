# Load testing

`browse.js` uses [autocannon](https://github.com/mcollina/autocannon) to simulate many
simultaneous visitors hitting the public, unauthenticated read endpoints — the traffic
pattern real users generate just by loading pages (company/professional listings and
detail pages).

## Running it

```bash
# against local dev (apps/api running on :3001)
pnpm loadtest

# against a longer/heavier run
BASE_URL=http://localhost:3001 CONNECTIONS=50 DURATION=30 pnpm loadtest
```

Point `BASE_URL` at a local or staging deployment only. Never run this against
production without explicit sign-off — sustained concurrent load is exactly what
this script generates.

## Rate limiting will dominate the result by default

The API rate-limits every IP to `RATE_LIMIT_MAX` requests per `RATE_LIMIT_TTL_MS`
(120 req/min by default — see [`../.env.example`](../.env.example)). A load test run
from one machine is, from the API's point of view, one IP — so by default this script
mostly measures "does the rate limiter correctly reject a burst from one source"
(expected — 429s here mean the limiter is working), not the server's real capacity for
many _different_ users.

To measure real throughput/capacity instead, raise the limit for the duration of the
run (set it back afterward, or just don't commit the override):

```bash
RATE_LIMIT_MAX=100000 pnpm --filter @linkedout/api dev
# in another terminal
CONNECTIONS=50 DURATION=30 pnpm loadtest
```

## Seed data

The script hits a fixed company ID (`00000000-0000-4000-8000-000000000003`, the seed
company from `packages/database`). Override with `SEED_COMPANY_ID` if your target
database has different data.
