# ADR-003: Use Next.js for the frontend and NestJS for the backend

- Status: Accepted
- Date: 2026-08-03

## Context
The platform needs a modern user experience plus a robust API foundation with clear service boundaries.

## Decision
Use Next.js 16 and React 19 for the frontend experience, and NestJS for backend services and REST APIs.

## Consequences
- Frontend and backend can evolve independently while sharing contracts.
- Strong typing and API documentation are easier to maintain.
- Requires clear API boundary management and contract testing.
