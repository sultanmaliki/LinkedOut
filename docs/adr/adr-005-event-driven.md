# ADR-005: Use event-driven integration for notifications and search

- Status: **Rejected** (superseded — see update below)
- Date: 2026-08-03
- Updated: not adopted; the product direction ([vision.md](../vision.md), [decisions.md](../decisions.md)) explicitly excludes notifications, search infrastructure, and event-driven architecture from current scope. The system remains a plain synchronous request/response API. This ADR is kept as a historical record of the proposal, not current or planned direction.

## Context

The platform will eventually include notifications, search indexing, moderation workflows, and AI-assisted features that benefit from decoupled processing.

## Decision (as originally proposed, not adopted)

Use an event-driven architecture for asynchronous background work such as search indexing, generating notifications, and moderation workflows.

## Consequences

- Better scalability and resilience.
- Clear separation of synchronous request handling from background work.
- Requires careful event schema management and retry policies.

## Why it was rejected

Notifications, search, and AI-assisted features were all decided against for the current product scope (see [decisions.md](../decisions.md) D-004, D-016). Without those consumers, there's no asynchronous workload that needs decoupling — adding an event bus would be infrastructure without a use case. Valkey/Meilisearch/MinIO remain provisioned in `docker-compose.yml` from this earlier plan but have no application code wiring.
