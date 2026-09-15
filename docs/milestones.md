# Milestone Planning

See [PROJECT_STATUS.md](../PROJECT_STATUS.md) for the detailed, continuously-updated status. This file tracks the milestone-level narrative.

## Milestone 0 — Project Foundation — Done

- Repository setup, documentation and governance, CI/local infrastructure, ADRs

## Milestone 1 — Core User Experience — Done

- Auth, professional/company profiles, the reverse-hiring opportunity flow, posts feed, verified reviews

## Milestone 2 — Trust and Moderation — Mostly done

- Employment/company verification flows: done
- Moderation cases/actions, trust flags, audit logs, admin role management: done
- Reputation scoring built on top of the existing trust/moderation tables: not yet started

## Milestone 3 — Hardening — In progress

- Full security audit + red-team review completed; every HIGH/MEDIUM finding fixed and regression-tested (see [security.md](security.md))
- Remaining: database indexes, real email provider, rate limiting, migration-based CI

## Milestone 4 — Deliberately deferred

Notifications, search/cache/storage backed by the provisioned-but-unused Meilisearch/Valkey/MinIO services, AI-assisted features, analytics/experimentation. These are not roadmapped — see [vision.md](vision.md) Non-Goals and [decisions.md](decisions.md).
