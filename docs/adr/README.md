# Architecture Decision Records

This directory stores ADRs for significant architectural choices affecting the LinkedOut platform.

## Template

- Title
- Status
- Context
- Decision
- Consequences

## ADRs

- [ADR-001](adr-001-monorepo.md): Use a monorepo with Turborepo for frontend and backend delivery — **Accepted**, implemented
- [ADR-002](adr-002-postgres-drizzle.md): Use PostgreSQL with Drizzle ORM as the system of record — **Accepted**, implemented
- [ADR-003](adr-003-nextjs-nestjs.md): Use NestJS for API services and Next.js for the frontend experience — **Accepted**, implemented
- [ADR-004](adr-004-docker-compose.md): Use Docker Compose for initial self-hosted deployments — **Accepted**, implemented (local dev only; no production deployment exists yet)
- [ADR-005](adr-005-event-driven.md): Use event-driven integration for notifications, search, and moderation workflows — **Rejected**, not adopted
