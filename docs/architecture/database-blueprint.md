# LinkedOut Database Blueprint

> Status: Locked
> Last Updated: August 2026
> Version: MVP v1

---

# Purpose

This document defines the production database architecture of LinkedOut.

Before writing any Drizzle schema or PostgreSQL migration, every entity, relationship, constraint, and database rule must be defined here.

---

# Design Principles

- Normalize data (3NF or better)
- Privacy first
- Historical data must remain accurate
- Verification over assumptions
- No duplicated information
- Separate business logic from persistence
- AI must never influence database design

---

# Step 1 — Master Entity List

## Authentication

- User

---

## Professional Domain

- ProfessionalProfile
- EmploymentHistory
- EmploymentExpectation
- PortfolioLink
- Skill
- ProfessionalSkill
- Verification

---

## Company Domain

- Company
- CompanyProfile
- CompanyLocation
- CompanyVerification
- CompanyAdmin
- Benefit
- CompanyBenefit

---

## Professional Publishing

- Post
- Attachment
- Comment
- Like

---

## Hiring

- Job
- Opportunity
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

Total Entities

29

---

# Step 2 — Relationships

## User

```
User

1 ─────── 1 ProfessionalProfile

1 ─────── N CompanyAdmin

1 ─────── N Verification

1 ─────── N Post

1 ─────── N Comment

1 ─────── N Like
```

---

## Professional

```
ProfessionalProfile

1 ─────── N EmploymentHistory

1 ─────── 1 EmploymentExpectation

1 ─────── N PortfolioLink

1 ─────── N ProfessionalSkill

1 ─────── N Opportunity

1 ─────── N Review
```

---

## Skills

```
Skill

N ─────── N ProfessionalProfile

↓

ProfessionalSkill
```

---

## Employment

```
EmploymentHistory

N ─────── 1 Company

N ─────── 1 CompanyLocation

1 ─────── 0..1 Verification

1 ─────── 0..1 Review
```

---

## Company

```
Company

1 ─────── 1 CompanyProfile

1 ─────── N CompanyLocation

1 ─────── 1 CompanyVerification

1 ─────── N CompanyAdmin

1 ─────── N CompanyBenefit

1 ─────── N Job

1 ─────── N Review
```

---

## Jobs

```
Job

N ─────── 1 Company

N ─────── 1 CompanyLocation

1 ─────── N Opportunity
```

---

## Opportunity

```
Opportunity

N ─────── 1 Job

N ─────── 1 ProfessionalProfile

1 ─────── 0..1 ProfessionalResponse

1 ─────── N HiringPipeline
```

---

## ProfessionalResponse

```
ProfessionalResponse

1 ─────── N ContactMethod
```

---

## Posts

```
Post

1 ─────── N Attachment

1 ─────── N Comment

1 ─────── N Like
```

---

## Reviews

```
Review

1 ─────── N ReviewRating

1 ─────── 0..1 CompanyReply

1 ─────── 1 ReviewSnapshot

1 ─────── 1 ProfessionalSnapshot
```

---

# Special Design Decisions

## Company Posts

Post contains:

- user_id
- company_id (nullable)

Rules

company_id IS NULL

→ Professional Post

company_id IS NOT NULL

→ Official Company Post

---

## Hiring Pipeline

HiringPipeline is append-only.

Each stage is stored as a new record.

Example

DISCOVERED

↓

OPPORTUNITY_SENT

↓

OPPORTUNITY_ACCEPTED

↓

SCREENING

↓

TECHNICAL

↓

HR

↓

OFFER

↓

HIRED

No stage is overwritten.

---

# Database Normalization

Current schema satisfies Third Normal Form.

Normalized Tables

- ProfessionalSkill
- CompanyBenefit
- ReviewRating
- ContactMethod
- PortfolioLink

Avoid

- Arrays
- Repeated columns
- JSON blobs for structured data

---

# Database Constraints

## Primary Keys

All entities use

UUID v7

---

## Audit Columns

Every table

- created_at
- updated_at

Sensitive tables additionally support

- created_by
- updated_by

---

## Soft Deletes

Supported

- ProfessionalProfile
- Company
- Job
- Post
- Review

Fields

- deleted_at
- deleted_by

---

Hard Deletes

- Like
- CompanyBenefit
- ProfessionalSkill
- ContactMethod
- ReviewRating

---

## Cascade Rules

### Cascade

Post

↓

Attachment

↓

Comment

↓

Like

---

Opportunity

↓

ProfessionalResponse

↓

ContactMethod

---

### Restrict

Company

↓

Jobs

↓

Employment History

↓

Reviews

---

EmploymentHistory

↓

Verification

↓

Review

---

# Unique Constraints

User

- email
- username

Company

- slug
- website

Skill

- name

Benefit

- name

Like

(post_id,user_id)

ProfessionalSkill

(professional_profile_id,skill_id)

CompanyBenefit

(company_id,benefit_id)

CompanyAdmin

(company_id,user_id)

Opportunity

(job_id,professional_profile_id)

Review

employment_history_id

---

# Index Strategy

Professional

- skills
- experience
- location
- availability

Company

- industry
- location
- trust_score

Job

- status
- work_mode
- location
- employment_type

Post

- created_at
- category

Review

- company_id
- overall_score

---

# Storage Strategy

PostgreSQL

Stores metadata only.

MinIO

Stores

- Images
- Videos
- Documents
- Verification Files

Database stores

- url
- mime_type
- checksum
- file_size

---

# Search Strategy

Search Engine

Meilisearch

Indexed

- Professionals
- Companies
- Jobs
- Posts

PostgreSQL remains source of truth.

---

# Cache Strategy

Valkey

Cache

- Company Profile
- Professional Profile
- Search Suggestions
- Trending Posts

Never cache authentication.

---

# Privacy Rules

Contact information is shared only after a Professional accepts an Opportunity.

Professional chooses which contact methods to share.

At least one contact method is required.

After the configured retention period

- Contact details are securely deleted

Audit records remain.

---

# Audit Log

Sensitive actions are append-only.

Examples

- Verification Approved
- Company Verified
- Opportunity Accepted
- Review Reported
- Review Removed
- Company Reported
- Professional Reported

AuditLog

- id
- actor_user_id
- entity_type
- entity_id
- action
- metadata
- created_at

Audit logs are immutable.

---

# Architecture Rating

Normalization

★★★★★

Scalability

★★★★★

Privacy

★★★★★

Maintainability

★★★★★

Status

Production Ready
