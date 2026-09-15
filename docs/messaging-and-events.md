# Messaging and Event-Driven Architecture

> **Status: Rejected, not implemented.** [ADR-005](adr/adr-005-event-driven.md) was never adopted — the system is a plain synchronous request/response API with no message queue or event bus. This is a design sketch, kept for reference, not the current or planned architecture. See [architecture.md](architecture.md) and [decisions.md](decisions.md).

## Goals

- Decouple write operations from heavyweight background tasks
- Support notifications, search indexing, moderation, and AI workflows
- Make the system resilient to bursts and downstream failures

## Event Backbone

- Use a message queue or event bus for asynchronous work
- Maintain clear event contracts and versioning
- Publish domain events from transactional boundaries
- Consume events via dedicated workers

## Core Events

- `user.registered`
- `review.created`
- `review.flagged`
- `company.profile.updated`
- `application.submitted`
- `verification.requested`

## Reliability Patterns

- At-least-once delivery with idempotency keys
- Dead-letter queues for repeated failures
- Event replay tooling for recovery and backfills
- Explicit retry budgets and timeouts
