# ADR-002: Use PostgreSQL with Drizzle ORM

- Status: Accepted
- Date: 2026-08-03

## Context
The product requires a relational system of record for identity, company profiles, reviews, applications, moderation, and auditing.

## Decision
Use PostgreSQL as the primary relational database and Drizzle ORM for schema management, migrations, and query access.

## Consequences
- Strong relational integrity for review and moderation workflows.
- Clear path to future horizontal scaling and read replicas.
- Requires deliberate schema versioning and migration discipline.
