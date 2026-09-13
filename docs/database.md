# Database Design

## Canonical Source

The authoritative database design lives in `docs/architecture/`:

- [schema-freeze.md](architecture/schema-freeze.md) — frozen entity list and business rules (source of truth)
- [database-blueprint.md](architecture/database-blueprint.md) — full design rationale, constraints, index/cache/storage strategy
- [er-diagram.md](architecture/er-diagram.md) — entity-relationship diagram
- [relationship-matrix.md](architecture/relationship-matrix.md) — per-entity relationship detail

This file previously described a generic, traditional-hiring schema (`users`, `employees`, `applications`, `application_events`) that predated the frozen design and does not match the implemented schema or the product decision that professionals do not submit applications ([decisions.md](decisions.md), D-001). It has been superseded — do not use it as a reference.

## Overview

PostgreSQL is the system of record. Drizzle ORM (`packages/database`) manages schema, migrations, and query building. The schema is organized around six domains, all frozen per [schema-freeze.md](architecture/schema-freeze.md):

- **Authentication** — User
- **Professional** — ProfessionalProfile, EmploymentHistory, EmploymentExpectation, PortfolioLink, Skill, ProfessionalSkill, EmploymentVerification
- **Company** — Company, CompanyProfile, CompanyLocation, CompanyVerification, CompanyAdmin, Benefit, CompanyBenefit
- **Publishing** — Post, Attachment, Comment, Like
- **Hiring** — Job, Opportunity, OpportunitySnapshot, ProfessionalResponse, ContactMethod, HiringPipeline
- **Reviews** — Review, ReviewRating, CompanyReply, ReviewSnapshot, ProfessionalSnapshot
- **Moderation** — ModerationCase, ModerationAction, TrustFlag, AuditLog

## Data Principles

- UUIDv7 primary keys everywhere
- Third Normal Form (3NF) — no arrays or JSON blobs for structured data
- Privacy first — contact info shared only after opportunity acceptance
- Historical accuracy via immutable snapshots (ReviewSnapshot, ProfessionalSnapshot, OpportunitySnapshot)
- HiringPipeline and AuditLog are append-only
- PostgreSQL is the source of truth; Meilisearch handles search; Valkey handles caching; MinIO stores files

Schema changes require updating `docs/architecture/schema-freeze.md` first — see D-019/D-020 in [decisions.md](decisions.md).
