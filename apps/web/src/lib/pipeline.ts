import type { DisplayStatus } from './types';

export const PIPELINE_STAGES = [
  'SENT',
  'ACCEPTED',
  'INTERVIEW_SCHEDULED',
  'REVIEWING',
  'OFFER_RELEASED',
  'OFFER_ACCEPTED',
] as const;

export const PIPELINE_STAGE_LABELS: Record<(typeof PIPELINE_STAGES)[number], string> = {
  SENT: 'Sent',
  ACCEPTED: 'Accepted',
  INTERVIEW_SCHEDULED: 'Interview',
  REVIEWING: 'Reviewing',
  OFFER_RELEASED: 'Offer sent',
  OFFER_ACCEPTED: 'Offer accepted',
};

const EXIT_STAGE_LABELS: Record<string, string> = {
  DECLINED: 'Declined',
  REJECTED: 'Not selected',
  WITHDRAWN: 'Withdrawn',
};

export function isExitStage(stage: string): boolean {
  return stage in EXIT_STAGE_LABELS;
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export type StatusTone = 'emerald' | 'gold' | 'rose' | 'neutral';

export interface StatusDescription {
  label: string;
  tone: StatusTone;
}

/**
 * Turns a computed DisplayStatus into perspective-aware copy. See
 * docs/architecture/hiring-pipeline-v2.md for the underlying tier rules --
 * this is presentation only, no business logic.
 */
export function describeStatus(
  displayStatus: DisplayStatus,
  perspective: 'professional' | 'company',
): StatusDescription {
  const { stage, ownedBy, tier, deadline } = displayStatus;

  if (isExitStage(stage)) {
    return { label: EXIT_STAGE_LABELS[stage]!, tone: stage === 'WITHDRAWN' ? 'neutral' : 'rose' };
  }

  if (stage === 'OFFER_ACCEPTED') {
    return { label: perspective === 'company' ? 'Onboarded' : 'Offer accepted', tone: 'emerald' };
  }

  const isYourTurn = ownedBy === perspective;
  const deadlineStr = deadline ? formatShortDate(deadline) : null;

  if (tier === 'hardClosed') {
    return {
      label: ownedBy === 'professional' ? 'Expired — no response' : 'No response received',
      tone: 'rose',
    };
  }

  if (tier === 'softFlag') {
    return {
      label: isYourTurn ? 'Running late — please respond' : 'Running late',
      tone: 'gold',
    };
  }

  if (isYourTurn) {
    return { label: deadlineStr ? `Your turn — by ${deadlineStr}` : 'Your turn', tone: 'emerald' };
  }

  return { label: deadlineStr ? `Waiting — by ${deadlineStr}` : 'Waiting', tone: 'neutral' };
}
