# ADR-005: Use event-driven integration for notifications and search

- Status: Proposed
- Date: 2026-08-03

## Context
The platform will eventually include notifications, search indexing, moderation workflows, and AI-assisted features that benefit from decoupled processing.

## Decision
Use an event-driven architecture for asynchronous background work such as search indexing, generating notifications, and moderation workflows.

## Consequences
- Better scalability and resilience.
- Clear separation of synchronous request handling from background work.
- Requires careful event schema management and retry policies.
