import type { PipelineStage } from './hiring-pipeline.repository';

export const SYSTEM_DEFAULT_RESPONSE_WINDOW_DAYS = 30;
export const SYSTEM_DEFAULT_OFFER_WINDOW_DAYS = 14;

// Fixed thresholds (not customizable) for the company-owned mid-pipeline
// stages -- see docs/architecture/hiring-pipeline-v2.md for the reasoning.
const ACCEPTED_SOFT_FLAG_DAYS = 10;
const INTERVIEW_SOFT_FLAG_DAYS = 10;
const INTERVIEW_HARD_CLOSE_DAYS = 30;
const REVIEWING_SOFT_FLAG_DAYS = 14;
const REVIEWING_HARD_CLOSE_DAYS = 30;

export const MIN_WINDOW_DAYS = 7;
export const MAX_WINDOW_DAYS = 60;

export type PipelineTier = 'onTime' | 'softFlag' | 'hardClosed' | 'terminal';
export type PipelineOwner = 'professional' | 'company' | null;

export interface DisplayStatus {
  stage: PipelineStage;
  ownedBy: PipelineOwner;
  deadline: Date | null;
  tier: PipelineTier;
  daysRemaining: number | null;
}

export interface ComputeDisplayStatusInput {
  stage: PipelineStage;
  enteredAt: Date;
  scheduledAt: Date | null;
  // Only meaningful for SENT/OFFER_RELEASED -- already resolved by the
  // caller (per-entry override -> company default -> system default).
  effectiveWindowDays: number | null;
  now: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

function daysBetween(from: Date, to: Date): number {
  return (to.getTime() - from.getTime()) / DAY_MS;
}

function terminal(stage: PipelineStage): DisplayStatus {
  return { stage, ownedBy: null, deadline: null, tier: 'terminal', daysRemaining: null };
}

function hardTimerStatus(
  stage: PipelineStage,
  ownedBy: PipelineOwner,
  enteredAt: Date,
  windowDays: number,
  now: Date,
): DisplayStatus {
  const deadline = addDays(enteredAt, windowDays);
  const daysRemaining = daysBetween(now, deadline);

  return {
    stage,
    ownedBy,
    deadline,
    tier: daysRemaining < 0 ? 'hardClosed' : 'onTime',
    daysRemaining,
  };
}

function softOnlyStatus(
  stage: PipelineStage,
  ownedBy: PipelineOwner,
  enteredAt: Date,
  softFlagDays: number,
  now: Date,
): DisplayStatus {
  const softDeadline = addDays(enteredAt, softFlagDays);
  const daysRemaining = daysBetween(now, softDeadline);

  return {
    stage,
    ownedBy,
    deadline: softDeadline,
    tier: daysRemaining < 0 ? 'softFlag' : 'onTime',
    daysRemaining,
  };
}

function twoTierStatus(
  stage: PipelineStage,
  ownedBy: PipelineOwner,
  anchor: Date,
  softDays: number,
  hardDays: number,
  now: Date,
): DisplayStatus {
  const softDeadline = addDays(anchor, softDays);
  const hardDeadline = addDays(anchor, hardDays);

  if (now.getTime() < softDeadline.getTime()) {
    return {
      stage,
      ownedBy,
      deadline: softDeadline,
      tier: 'onTime',
      daysRemaining: daysBetween(now, softDeadline),
    };
  }

  if (now.getTime() < hardDeadline.getTime()) {
    return {
      stage,
      ownedBy,
      deadline: hardDeadline,
      tier: 'softFlag',
      daysRemaining: daysBetween(now, hardDeadline),
    };
  }

  return {
    stage,
    ownedBy,
    deadline: hardDeadline,
    tier: 'hardClosed',
    daysRemaining: daysBetween(now, hardDeadline),
  };
}

/**
 * Pure, side-effect-free status computation -- the heart of the "compute at
 * read time, write nothing proactively" design. See
 * docs/architecture/hiring-pipeline-v2.md for the per-stage rules table.
 */
export function computeDisplayStatus(input: ComputeDisplayStatusInput): DisplayStatus {
  const { stage, enteredAt, scheduledAt, effectiveWindowDays, now } = input;

  switch (stage) {
    case 'SENT':
      return hardTimerStatus(
        stage,
        'professional',
        enteredAt,
        effectiveWindowDays ?? SYSTEM_DEFAULT_RESPONSE_WINDOW_DAYS,
        now,
      );
    case 'OFFER_RELEASED':
      return hardTimerStatus(
        stage,
        'professional',
        enteredAt,
        effectiveWindowDays ?? SYSTEM_DEFAULT_OFFER_WINDOW_DAYS,
        now,
      );
    case 'ACCEPTED':
      return softOnlyStatus(stage, 'company', enteredAt, ACCEPTED_SOFT_FLAG_DAYS, now);
    case 'REVIEWING':
      return twoTierStatus(
        stage,
        'company',
        enteredAt,
        REVIEWING_SOFT_FLAG_DAYS,
        REVIEWING_HARD_CLOSE_DAYS,
        now,
      );
    case 'INTERVIEW_SCHEDULED':
      return twoTierStatus(
        stage,
        'company',
        scheduledAt ?? enteredAt,
        INTERVIEW_SOFT_FLAG_DAYS,
        INTERVIEW_HARD_CLOSE_DAYS,
        now,
      );
    case 'OFFER_ACCEPTED':
    case 'DECLINED':
    case 'REJECTED':
    case 'WITHDRAWN':
      return terminal(stage);
  }
}

export function resolveWindowDays(
  perEntryOverride: number | null | undefined,
  companyDefault: number | null | undefined,
  systemDefault: number,
): number {
  return perEntryOverride ?? companyDefault ?? systemDefault;
}
