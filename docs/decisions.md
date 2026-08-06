# LinkedOut Decision Log

> Product Decisions
> Status: Active

This document records important product and business decisions made during development.

---

# D-001

## Decision

Companies discover professionals.

Professionals do not submit traditional job applications.

## Reason

LinkedOut exists to reverse the traditional hiring process.

---

# D-002

## Decision

Professionals control when and how contact information is shared.

## Reason

Privacy-first platform.

---

# D-003

## Decision

Accepting an opportunity requires at least one contact method.

## Reason

Companies must have a way to continue hiring outside LinkedOut.

---

# D-004

## Decision

LinkedOut does not implement an internal messaging platform.

## Reason

Hiring should continue through the company's preferred communication channel.

---

# D-005

## Decision

Companies cannot delete or hide reviews.

## Reason

Transparency must not depend on company approval.

---

# D-006

## Decision

Reviews remain public while under moderation.

## Reason

Reporting should not become a censorship mechanism.

---

# D-007

## Decision

Professional reviews require verified employment.

## Reason

Verified reviews create trustworthy company ratings.

---

# D-008

## Decision

HiringPipeline is immutable.

## Reason

Hiring history must remain auditable.

---

# D-009

## Decision

Historical workflows use snapshots.

## Reason

Past events should never change because current data changed.

Current snapshots:

- ReviewSnapshot
- ProfessionalSnapshot
- OpportunitySnapshot

---

# D-010

## Decision

Standalone PDFs are allowed.

Images and videos require a post.

## Reason

Certificates, research papers, resumes, and publications should exist independently of the feed.

---

# D-011

## Decision

Comment threads are limited to one reply level.

## Reason

Prevent long arguments while preserving meaningful discussion.

---

# D-012

## Decision

Posts support scheduled publishing and scheduled archiving.

## Reason

Companies and professionals often prepare content in advance.

---

# D-013

## Decision

Archived posts can be restored.

Only the publisher sees that the post was previously archived.

## Reason

Avoid exposing unnecessary historical state publicly.

---

# D-014

## Decision

Professional accounts remain recoverable for 30 days after deactivation.

## Reason

Prevent accidental permanent account loss.

---

# D-015

## Decision

Opportunities expire automatically when their associated job closes.

## Reason

Professionals should never accept unavailable positions.

---

# D-016

## Decision

Artificial Intelligence is assistive, not central.

## Reason

LinkedOut is a hiring platform, not an AI product.

AI should improve search, moderation, spam detection, and user experience without replacing human judgment.

---

# D-017

## Decision

All moderation is centralized.

## Reason

One moderation workflow is simpler, more scalable, and easier to audit than multiple independent reporting systems.

---

# D-018

## Decision

Company Trust Score is public.

Professional Trust is internal only.

## Reason

Companies should be accountable to professionals, while professionals should not be publicly ranked or shamed.

---

# D-019

## Decision

Database changes require architecture changes first.

## Reason

Prevent schema drift and maintain long-term consistency.

---

# D-020

## Decision

Architecture documentation is the source of truth.

## Reason

Implementation follows architecture, not the other way around.
