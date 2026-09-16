# Hiring Pipeline v2 — Ghosting Prevention & Responsiveness Scoring

> Status: Fully implemented (schema, API, and frontend). This document is the agreed design from a product discussion, now built end-to-end and verified live in the browser (both perspectives, desktop and mobile). See [PROJECT_STATUS.md](../../PROJECT_STATUS.md) for the current summary.

## Problem

Ghosting happens on both sides of the hiring relationship today, and the platform currently does nothing about it:

- A company can let an accepted opportunity sit in `REVIEWING`/post-interview limbo indefinitely — there is no signal, no timeout, no consequence. (Motivating real-world case: an interview with zero follow-up, not even pass/fail, for 5 months.)
- A professional can let a released offer sit unanswered indefinitely, tying up a company's hiring slot with no resolution.
- `opportunities.expiresAt` and `contact_methods.expiresAt` columns already exist in the schema but are wired to nothing. The only thing that currently sets `status = 'EXPIRED'` is a company manually closing/archiving a job (`JobService.updateJob` → `JobRepository.expirePendingOpportunities`).
- A company cannot currently see a professional's contact methods after they accept, despite the UI copy promising "shared with the company only after you accept" — `OpportunityRepository.getContactMethods()` exists but has zero callers. This is a pre-existing bug, unrelated to timers, but it's a hard blocker for a company acting on an acceptance at all, so it's fixed as part of this work.
- There is no company-wide "opportunities we've sent" view — only a per-job toggle buried in the Jobs tab. Once stages carry urgency (overdue/at-risk), a company needs one place that surfaces everything, not 10 separate job cards to check individually.

## Design principles

1. **One shared pipeline, not two.** The professional's and company's views are the same underlying `hiring_pipelines` timeline, shown with perspective-appropriate copy — never two independently-tracked state machines that could disagree.
2. **Turn-based ownership.** Every stage has exactly one owning party whose action is expected next. Whoever owns the current stage is the one a timer counts against.
3. **Two-tier response: soft flag, then hard consequence.** A single "expired" cliff either kills legitimate slow-moving pipelines (interviews get rescheduled for real reasons) or has no teeth (a silent flag nobody sees). Two tiers solve both: an early visible warning, then an automatic resolution that doesn't require the stalling party to do anything.
4. **Compute at read time, write nothing proactively.** No cron, no scheduler — this codebase has neither today, and introducing one is a bigger architectural commitment than this feature needs. "Is this overdue" is a pure function of `(stage, enteredAt, windowDays, now)`, evaluated whenever an opportunity is read (any API response), not written to the database on a timer. The one exception: a professional's explicit "mark unresponsive" action is a real user action and is persisted.
5. **A decline counts as responsive.** The actual harm is silence, not a "no." Someone who explicitly declines fast must score better than someone who says nothing — this is the core of the original complaint (no pass/fail signal, not that it was slow).
6. **Responsiveness score is computed, not flagged.** It is _not_ a new use of the existing `trust_flags` table — that table is for moderator judgment calls (fake profiles, harassment). A timer elapsing is a mechanical fact, not a human judgment call, and mixing the two would make both signals less trustworthy. The score is a live aggregate over timeout events, not a row anyone writes.
7. **Private for v1.** Both the "ghosted" closure and the responsiveness score are visible only to their own owner for now. Public display (e.g., on a company's profile) is a deliberately separate, later decision — it's a bigger call than a timer feature (reputational impact needs a fair methodology and probably a dispute path before it's fair to ship).

## Canonical pipeline

Replaces the current mixed vocabulary (4 uncontrolled lifecycle strings + 6 loosely-related business stages in `HIRING_PIPELINE_STAGES`) with one enum:

```
SENT → ACCEPTED → INTERVIEW_SCHEDULED → REVIEWING → OFFER_RELEASED → OFFER_ACCEPTED
                ↘ DECLINED           ↘ REJECTED (from any company-owned stage)   ↘ (professional declines the offer)
       ↘ WITHDRAWN (professional, within 24h of ACCEPTED — existing rule, unchanged)
```

| Stage                 | Owned by     | Timer behavior                                                                                                                                                                                                                                                     |
| --------------------- | ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `SENT`                | Professional | Hard: auto-`EXPIRED` after `windowDays` (default 30) with no response. _(Existing mechanism — `opportunities.status`/`expiresAt` already model this; this work adds automatic, read-time detection instead of only-on-manual-job-close.)_                          |
| `ACCEPTED`            | Company      | Soft flag after a fixed threshold (10d); no hard auto-close — company hasn't even scheduled anything yet, no `windowDays` override point exists here.                                                                                                              |
| `INTERVIEW_SCHEDULED` | Company      | Anchored to `scheduledAt` (the interview date, company-supplied). Soft flag 10 days after `scheduledAt`; hard "no response received" (computed, not stored) 30 days after `scheduledAt`.                                                                           |
| `REVIEWING`           | Company      | Soft flag after 14 days in stage; hard "no response received" after 30 days in stage.                                                                                                                                                                              |
| `OFFER_RELEASED`      | Professional | Hard: computed "no response — offer lapsed" after `windowDays` (default 14) with no accept/decline.                                                                                                                                                                |
| `OFFER_ACCEPTED`      | —            | Terminal. Triggers a private banner nudge on the professional's own employment-history page (not a push notification — no notification infra exists or is planned before v2) to update their employment record. Company-side copy for the same state: "Onboarded." |

Old free-text values map onto the new enum in the migration: `OPPORTUNITY_SENT→SENT`, `OPPORTUNITY_ACCEPTED→ACCEPTED`, `OPPORTUNITY_DECLINED→DECLINED`, `WITHDRAWN→WITHDRAWN` (unchanged), `SCREENING`/`TECHNICAL`/`HR→INTERVIEW_SCHEDULED` (collapsed — round-level detail, if wanted later, stays in the existing free-text `notes` field rather than expanding the enum), `OFFER→OFFER_RELEASED`, `HIRED→OFFER_ACCEPTED`, `REJECTED→REJECTED` (unchanged).

"Ghosted"/"no response received"/"overdue" labels are **never persisted** for the mid-pipeline stages — they're computed at read time from `(stage, enteredAt, windowDays or default, now)`. The one persisted exception is the professional's manual "mark unresponsive" action (see below), because that's a real action a user took, not an inference.

## Data model changes (one migration)

- `hiring_pipelines.stage`: `text` → new `pipeline_stage` Postgres enum (9 values above), with a data-migration `UPDATE` mapping old free-text values per the table above.
- `hiring_pipelines.scheduled_at`: new nullable `timestamptz` — the interview date, set when a company appends `INTERVIEW_SCHEDULED`.
- `hiring_pipelines.window_days`: new nullable `int` — per-stage-entry override of the response window; null falls back to the company default, then the system default.
- `companies.default_response_window_days`: new nullable `int` — company-wide default for `SENT`.
- `companies.default_offer_window_days`: new nullable `int` — company-wide default for `OFFER_RELEASED`.
- `opportunities.response_window_days`: new nullable `int` — per-send override, set at `POST /jobs/:jobId/opportunities` time.
- `opportunities.manually_flagged_unresponsive_at`: new nullable `timestamptz` — set by the professional's explicit "mark unresponsive" action; the one write in this whole feature that isn't a real stage transition.

No schema changes needed for the responsiveness score — it's a live aggregate query, nothing to store.

## Backend changes

- **`PipelineStatusService`** (new, pure/testable): `computeDisplayStatus(latestStage, enteredAt, windowDays, now) → { stage, ownedBy, deadline, tier: 'onTime'|'softFlag'|'hardClosed', daysRemaining }`. No side effects, no DB access — a pure function over already-fetched data, unit-tested directly against the table above (one test per stage × tier).
- Decorate every opportunity-returning response with the computed status: `MyOpportunityController.listMyOpportunities`, `JobOpportunityController.listOpportunities`, `OpportunityController.getOpportunity`, and the new company-wide endpoint below.
- **New `GET /companies/:id/opportunities`** (`CompanyOpportunityController`, company-admin-gated) — aggregates across all the company's jobs; this is the "history of sent opportunities" that doesn't exist today.
- **Fix the contact-methods bug**: new `GET /opportunities/:id/contact-methods` (company-admin-of-the-job OR the owning professional only), finally wiring the existing-but-dead `OpportunityRepository.getContactMethods()`.
- **`HiringPipelineController.appendStage`**: extend `AppendPipelineStageDto` with optional `scheduledAt` (required when `stage === 'INTERVIEW_SCHEDULED'`) and optional `windowDays` (7–60 bound, meaningful for `OFFER_RELEASED`).
- **`CreateOpportunityDto`**: add optional `responseWindowDays` (7–60 bound).
- **Company hiring settings**: extend the existing `PATCH /companies/:id` / `UpdateCompanyDto` with the two optional default-window fields — no new endpoint needed.
- **`ResponsivenessScoreService`** (new): `getProfessionalScore(profileId)` / `getCompanyScore(companyId)` — aggregate rate over the owning party's hard-timeout events (including manual "unresponsive" flags) in the trailing 12 months, `null`/"not enough data" under a 5-opportunity floor. Exposed as `GET /professionals/me/responsiveness` and `GET /companies/:id/responsiveness`, both self-only (private, per the design principle above).
- **`POST /professionals/me/opportunities/:id/flag-unresponsive`** — professional-only, allowed once the current stage has passed its soft-flag threshold; sets `manually_flagged_unresponsive_at`, counts immediately toward the company's responsiveness score without waiting for the hard-tier threshold.

## Frontend changes

- New shared `PipelineStepper` component (`apps/web/src/components/pipeline-stepper.tsx`) — horizontal step indicator + deadline/overdue badge, perspective-aware copy (professional vs. company), used everywhere an opportunity is listed.
- `OpportunityCard` (professional): render `PipelineStepper`; add "Flag as unresponsive" action when eligible.
- New `apps/web/src/app/companies/[id]/manage/opportunities-tab.tsx` (+ add "Opportunities" to the manage-page tab list) — backed by the new company-wide endpoint.
- `jobs-tab.tsx`'s existing per-job `OpportunityList`: switch from a raw UUID to the professional's name (join, same pattern used for the verification queue), add `PipelineStepper`, add a "View contact info" reveal once `ACCEPTED` (wired to the new contact-methods endpoint).
- Interview-scheduling UI: date picker for `scheduledAt` when a company appends `INTERVIEW_SCHEDULED`.
- Company hiring-settings UI (manage page) for the two default-window fields; optional per-send/per-offer override inputs on the relevant forms.
- Private responsiveness-score stat: professional's own profile/settings page; company's manage → Overview tab. Not shown on public profile pages.

## Explicitly deferred (not part of this pass)

- Public display of responsiveness scores / ghosting rates on profiles — needs a fair methodology (minimum sample, appeal path) before it's fair to ship; a separate decision when it comes up.
- Any notification/email/push around overdue stages — no notification infrastructure exists or is planned before v2 (see [notifications.md](../notifications.md)); the profile-update nudge above is an in-app banner shown on page load, not a push.
- Round-level interview detail (multiple named rounds) — folded into `INTERVIEW_SCHEDULED` + free-text notes for now rather than expanding the enum; revisit if it turns out to matter.

## Testing plan

- Unit tests for `computeDisplayStatus` — every stage × every tier (on-time / soft-flag / hard-closed), plus window-override precedence (per-send > company default > system default).
- Unit tests for `ResponsivenessScoreService` — min-sample floor, trailing-window filter, decline-counts-as-responsive.
- Controller/service tests for the new endpoints (company opportunities list, contact-methods reveal — including the authorization boundary, flag-unresponsive, hiring-settings update).
- Migration: verify the data-migration `UPDATE` maps every existing `hiring_pipelines` row to a valid new enum value against the actual local dataset before dropping the old `text` column.
