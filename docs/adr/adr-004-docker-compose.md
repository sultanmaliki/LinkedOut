# ADR-004: Use Docker Compose for initial self-hosted deployments

- Status: Accepted
- Date: 2026-08-03

## Context
LinkedOut needs a pragmatic deployment path on self-hosted Ubuntu infrastructure while remaining compatible with future cloud migration.

## Decision
Use Docker and Docker Compose as the initial deployment model, with Caddy as the reverse proxy and containerized support services.

## Consequences
- Fast local parity and production portability.
- Easier environment reproducibility.
- Future cloud migration will require container orchestration and environment-specific hardening.
