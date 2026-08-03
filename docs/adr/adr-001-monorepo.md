# ADR-001: Use a monorepo with Turborepo

- Status: Accepted
- Date: 2026-08-03

## Context
LinkedOut will evolve as a multi-surface product with web, API, shared UI, and infrastructure concerns that must stay aligned.

## Decision
Use a pnpm-based monorepo managed by Turborepo to coordinate builds, linting, and testing across applications and shared packages.

## Consequences
- Shared package reuse improves consistency.
- Cross-cutting changes are easier to review.
- Build orchestration requires discipline around package boundaries and caching.
