# Logging and Monitoring Strategy

> **Status: partially implemented.** Structured Pino logging and a health-check endpoint exist (see below). Prometheus/Grafana and Sentry are still not implemented — see [deployment.md](deployment.md), which is in the same state.

## Logging Strategy

- `apps/api` uses [nestjs-pino](https://github.com/iamolegga/nestjs-pino)
  (wired in `app.module.ts` / `main.ts`) — structured JSON logs in
  production, pretty-printed in dev. Set `LOG_LEVEL` to control verbosity.
- Every request gets a correlation ID (`req.id`, pino-http's default) that
  appears on every log line for that request — grep by it to trace one
  request end to end.
- `Authorization`/`Cookie` headers and `password`/`token`/`refreshToken`/
  `accessToken` body fields are redacted (`[redacted]`) before logging —
  never logged in plaintext.
- Business events at the application boundary and audit logs: not yet done —
  still open.

## Metrics and Monitoring

- `GET /health` (`apps/api/src/health`) checks Postgres connectivity — see
  [operational-runbook.md](operational-runbook.md).
- Prometheus, Grafana, and Sentry: not implemented. Sentry in particular
  needs a Sentry account/DSN, which is a decision for whoever owns that
  account — the app has no error-tracking SDK wired in yet.

## Alerting Priorities

- P1: API availability, auth failures, critical data integrity issues
- P2: high error rates, increased latency, queue backlog
- P3: search indexing lag or repeated background job failures

## Dashboards

- API latency and error rate
- Review submission throughput
- Search latency and index freshness
- Auth success and failure rates
- Storage and queue health
