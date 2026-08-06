# LinkedOut Relationship Matrix

> Status: Draft (Pending ER Diagram)
> Version: MVP v1

---

# Legend

| Symbol | Meaning      |
| ------ | ------------ |
| 1      | Exactly One  |
| 0..1   | Optional One |
| N      | Many         |

---

# Authentication

## User

| Related Entity      | Relationship | Notes                                        |
| ------------------- | ------------ | -------------------------------------------- |
| ProfessionalProfile | 1 → 0..1     | User may never create a professional profile |
| CompanyAdmin        | 1 → N        | One user can manage multiple companies       |
| Verification        | 1 → N        | Multiple verification requests over time     |
| Post                | 1 → N        | User creates posts                           |
| Comment             | 1 → N        | User comments                                |
| Like                | 1 → N        | User likes posts                             |
| ModerationCase      | 1 → N        | User can report entities                     |
| AuditLog            | 1 → N        | User performs actions                        |

---

# Professional

## ProfessionalProfile

| Related Entity        | Relationship | Notes                  |
| --------------------- | ------------ | ---------------------- |
| User                  | 1 → 1        | Belongs to one User    |
| EmploymentHistory     | 1 → N        | Multiple employments   |
| EmploymentExpectation | 1 → 1        | Current preferences    |
| PortfolioLink         | 1 → N        | Multiple links         |
| ProfessionalSkill     | 1 → N        | Junction table         |
| Opportunity           | 1 → N        | Opportunities received |

---

## EmploymentHistory

| Related Entity      | Relationship | Notes                       |
| ------------------- | ------------ | --------------------------- |
| ProfessionalProfile | N → 1        | Owner                       |
| Company             | N → 1        | Employer                    |
| CompanyLocation     | N → 0..1     | Nullable (Remote/Freelance) |
| Verification        | 1 → 0..1     | Optional verification       |
| Review              | 1 → 0..1     | One active review           |

---

## EmploymentExpectation

| Related Entity      | Relationship | Notes                   |
| ------------------- | ------------ | ----------------------- |
| ProfessionalProfile | 1 → 1        | One expectation profile |

---

## PortfolioLink

| Related Entity      | Relationship | Notes          |
| ------------------- | ------------ | -------------- |
| ProfessionalProfile | N → 1        | Multiple links |

---

## Skill

| Related Entity    | Relationship | Notes    |
| ----------------- | ------------ | -------- |
| ProfessionalSkill | 1 → N        | Junction |

---

## ProfessionalSkill

| Related Entity      | Relationship | Notes    |
| ------------------- | ------------ | -------- |
| ProfessionalProfile | N → 1        | Junction |
| Skill               | N → 1        | Junction |

Unique:
(professional_profile_id, skill_id)

---

# Company

## Company

| Related Entity      | Relationship | Notes                 |
| ------------------- | ------------ | --------------------- |
| CompanyProfile      | 1 → 1        | Public profile        |
| CompanyVerification | 1 → 1        | Verification          |
| CompanyLocation     | 1 → N        | Multiple locations    |
| CompanyAdmin        | 1 → N        | Admins                |
| CompanyBenefit      | 1 → N        | Junction              |
| Job                 | 1 → N        | Open positions        |
| Review              | 1 → N        | Reviews               |
| EmploymentHistory   | 1 → N        | Historical employment |

---

## CompanyProfile

Company ↔ CompanyProfile

1 : 1

---

## CompanyLocation

| Related Entity    | Relationship |
| ----------------- | ------------ |
| Company           | N → 1        |
| Job               | 1 → N        |
| EmploymentHistory | 1 → N        |

---

## CompanyVerification

Company ↔ CompanyVerification

1 : 1

---

## CompanyAdmin

| Related Entity | Relationship |
| -------------- | ------------ |
| Company        | N → 1        |
| User           | N → 1        |

Unique:

(company_id,user_id)

---

## Benefit

| Related Entity | Relationship |
| -------------- | ------------ |
| CompanyBenefit | 1 → N        |

---

## CompanyBenefit

| Related Entity | Relationship |
| -------------- | ------------ |
| Company        | N → 1        |
| Benefit        | N → 1        |

Unique:

(company_id,benefit_id)

---

# Publishing

## Post

| Related Entity | Relationship | Notes                 |
| -------------- | ------------ | --------------------- |
| User           | N → 1        | Publisher             |
| Company        | N → 0..1     | Official company post |
| Attachment     | 1 → N        | Media                 |
| Comment        | 1 → N        | Discussion            |
| Like           | 1 → N        | Appreciation          |

---

## Attachment

| Related Entity | Relationship |
| -------------- | ------------ |
| Post           | N → 0..1     |

Notes

- Images require Post
- Videos require Post
- PDFs may exist independently

---

## Comment

| Related Entity | Relationship |
| -------------- | ------------ |
| User           | N → 1        |
| Post           | N → 1        |
| Parent Comment | N → 0..1     |

Maximum nesting depth:

2

---

## Like

| Related Entity | Relationship |
| -------------- | ------------ |
| User           | N → 1        |
| Post           | N → 1        |

Unique

(post_id,user_id)

---

# Hiring

## Job

| Related Entity  | Relationship |
| --------------- | ------------ |
| Company         | N → 1        |
| CompanyLocation | N → 0..1     |
| Opportunity     | 1 → N        |

---

## Opportunity

| Related Entity       | Relationship |
| -------------------- | ------------ |
| Job                  | N → 1        |
| ProfessionalProfile  | N → 1        |
| ProfessionalResponse | 1 → 0..1     |
| HiringPipeline       | 1 → N        |

Unique

(job_id,professional_profile_id)

---

## ProfessionalResponse

| Related Entity | Relationship |
| -------------- | ------------ |
| Opportunity    | 1 → 1        |
| ContactMethod  | 1 → N        |

---

## ContactMethod

| Related Entity       | Relationship |
| -------------------- | ------------ |
| ProfessionalResponse | N → 1        |

Validation

Minimum one ContactMethod required.

---

## HiringPipeline

| Related Entity | Relationship |
| -------------- | ------------ |
| Opportunity    | N → 1        |

Immutable.

Every stage creates a new record.

---

# Reviews

## Review

| Related Entity       | Relationship |
| -------------------- | ------------ |
| EmploymentHistory    | 1 → 1        |
| Company              | N → 1        |
| ReviewRating         | 1 → N        |
| CompanyReply         | 1 → 0..1     |
| ReviewSnapshot       | 1 → 1        |
| ProfessionalSnapshot | 1 → 1        |

---

## ReviewRating

| Related Entity | Relationship |
| -------------- | ------------ |
| Review         | N → 1        |

---

## CompanyReply

| Related Entity | Relationship |
| -------------- | ------------ |
| Review         | 1 → 1        |

---

## ReviewSnapshot

Review ↔ ReviewSnapshot

1 : 1

---

## ProfessionalSnapshot

Review ↔ ProfessionalSnapshot

1 : 1

---

# Moderation

## ModerationCase

| Related Entity | Relationship |
| -------------- | ------------ |
| User           | N → 1        |

Supports reports for

- Company
- Professional
- Review
- Post
- Opportunity

---

## TrustFlag

| Related Entity | Relationship |
| -------------- | ------------ |
| User           | N → 1        |

Internal only.

Not publicly visible.

---

## AuditLog

| Related Entity | Relationship |
| -------------- | ------------ |
| User           | N → 1        |

Append-only.

Never updated.

Never deleted.

---

# Relationship Summary

| Entity               | Depends On                   |
| -------------------- | ---------------------------- |
| ProfessionalProfile  | User                         |
| EmploymentHistory    | ProfessionalProfile, Company |
| Job                  | Company                      |
| Opportunity          | Job, ProfessionalProfile     |
| ProfessionalResponse | Opportunity                  |
| ContactMethod        | ProfessionalResponse         |
| Review               | EmploymentHistory            |
| ReviewRating         | Review                       |
| CompanyReply         | Review                       |
| Post                 | User                         |
| Attachment           | Post (optional for PDFs)     |
| Comment              | User, Post                   |
| Like                 | User, Post                   |
| CompanyAdmin         | Company, User                |
| CompanyBenefit       | Company, Benefit             |
| ProfessionalSkill    | ProfessionalProfile, Skill   |

---

# Status

✅ Relationship Matrix Complete

Next Step

→ Generate Production ER Diagram

→ Freeze Database Schema

→ Begin Drizzle ORM Implementation
