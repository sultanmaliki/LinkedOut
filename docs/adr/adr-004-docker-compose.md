# ADR-004: Use Docker Compose for local development

- Status: Accepted — implemented for local development only; no production deployment exists yet
- Date: 2026-08-03

## Context

LinkedOut needs a pragmatic, reproducible local development environment, with a path to a real deployment later.

## Decision

Use Docker and Docker Compose for local development (`postgres`, `api`, and the provisioned-but-currently-unused `valkey`/`minio`/`meilisearch`). A reverse proxy (Caddy or otherwise) and a real deployment target are future decisions, not yet made — see [deployment.md](../deployment.md), marked deferred.

## Consequences

- Fast local parity between developer machines.
- Easier environment reproducibility.
- Production deployment strategy (reverse proxy, orchestration, environment-specific hardening) is still an open decision, not yet implemented.
