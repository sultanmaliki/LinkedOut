# Logging and Monitoring Strategy

> **Status: Deferred, not implemented.** The API uses NestJS's default console logger. There is no Pino, no Prometheus/Grafana, no Sentry, and no health-check endpoint today. This is a design sketch for a future production deployment, kept for reference — see [deployment.md](deployment.md), which is in the same state.

## Logging Strategy

- Use Pino for structured JSON logs
- Include correlation IDs on every request
- Log business events at the application boundary and security-sensitive operations in audit logs
- Avoid logging secrets, personal data, or tokens

## Metrics and Monitoring

- Prometheus for metrics collection
- Grafana for dashboards and alerting
- Sentry for error tracking and exception grouping
- Health checks for web, API, and dependency services

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
