# LinkedOut Schema Freeze

> Status: Frozen (MVP v1) — 33 entities implemented in `packages/database/src/schema`
> Last Updated: September 2026 (added `User.activeRefreshTokenId` for refresh-token rotation — see [security.md](../security.md))

---

# Purpose

This document represents the frozen database design for the LinkedOut MVP.

Once a schema is marked as frozen, changes must not be made directly in code.

Every database change must first update this document and the architecture documentation before implementation.

---

# Schema Change Policy

A schema change requires:

1. Update Schema Freeze
2. Update Relationship Matrix (if required)
3. Update ER Diagram (if required)
4. Review the impact
5. Implement using Drizzle migration

No exceptions.

---

# Database Principles

- UUID primary keys (v4, via `gen_random_uuid()`)
- Third Normal Form (3NF)
- Privacy first
- Historical accuracy
- Immutable audit trails
- No duplicated data
- PostgreSQL is the source of truth
- Meilisearch, Valkey, and MinIO are provisioned but not yet wired into any application code — search, caching, and file storage all currently go through PostgreSQL/URL columns directly. See [database.md](../database.md).

---

# Frozen Entities

## Authentication

- User

---

## Professional

- ProfessionalProfile
- EmploymentHistory
- EmploymentExpectation
- PortfolioLink
- Skill
- ProfessionalSkill
- EmploymentVerification

---

## Company

- Company
- CompanyProfile
- CompanyLocation
- CompanyVerification
- CompanyAdmin
- Benefit
- CompanyBenefit

---

## Publishing

- Post
- Attachment
- Comment
- Like

---

## Hiring

- Job
- Opportunity
- OpportunitySnapshot
- ProfessionalResponse
- ContactMethod
- HiringPipeline

---

## Reviews

- Review
- ReviewRating
- CompanyReply
- ReviewSnapshot
- ProfessionalSnapshot

---

## Moderation

- ModerationCase
- ModerationAction
- TrustFlag
- AuditLog

---

# Frozen Business Rules

## Professional

- Company discovers professionals.
- Professionals do not submit traditional applications.
- Professional controls contact sharing.
- At least one contact method is required after accepting an opportunity.

---

## Hiring

- Opportunity replaces traditional application.
- Company attaches one Job to an Opportunity.
- Opportunity expires automatically if Job closes.
- Company resend attempts are rate limited.
- HiringPipeline is immutable.
- Professional may withdraw within 24 hours.
- Professional account deactivation allows a 30-day recovery period.

---

## Reviews

- One active review per EmploymentHistory.
- Reviews require verified employment.
- Companies cannot delete reviews.
- Companies cannot hide reviews.
- Companies may reply once.
- Reviews remain public while under moderation.
- Historical snapshots are immutable.
- Review edits are limited by cooldown policy.

---

## Publishing

- Companies and professionals can publish posts.
- Images and videos require a post.
- PDFs may exist independently.
- Comments support only one reply level.
- Posts support scheduled publishing.
- Posts support scheduled archiving.
- Archived posts can be restored.
- Archive history is visible only to the publisher.
- Deleting a post may optionally preserve attachments.

---

## Moderation

- All reports enter ModerationCase.
- Moderation history is immutable.
- TrustFlag is internal only.
- Companies cannot moderate themselves.
- Platform moderators make final decisions.

---

# Frozen Database Rules

## Primary Keys

UUID everywhere, via Drizzle's `.defaultRandom()` (Postgres `gen_random_uuid()` — UUIDv4, not UUIDv7 as earlier drafts of this document said).

---

## Soft Deletes

Supported

- ProfessionalProfile
- Company
- Job
- Post
- Review

---

## Hard Deletes

- Like
- CompanyBenefit
- ProfessionalSkill
- ContactMethod
- ReviewRating

---

## Historical Data

Historical records never reference mutable business data without snapshots.

Current snapshots:

- ReviewSnapshot
- ProfessionalSnapshot
- OpportunitySnapshot

---

## Search

Meilisearch only.

---

## Cache

Valkey only.

---

## Storage

Files stored in MinIO.

Metadata stored in PostgreSQL.

---

## Privacy

Sensitive documents are deleted after verification.

Contact information is deleted after the configured retention period.

Audit history remains.

---

# MVP Freeze

The MVP entity list is frozen.

New entities may only be added after the MVP database is complete.

---

# Status

Database schema is considered frozen.

Future changes require architectural review before implementation.
