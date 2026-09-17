'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Mail, User } from 'lucide-react';

import { ApiError, apiFetch } from '@/lib/api';
import { formatEnum } from '@/lib/enums';
import { useConfirmDialog } from '@/lib/use-confirm-dialog';
import type {
  ContactMethod,
  OpportunityWithJobAndProfessional,
  ResponsivenessScore,
} from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input, Label, Textarea } from '@/components/ui/input';
import { PipelineStepper } from '@/components/pipeline-stepper';

type NextStage = 'INTERVIEW_SCHEDULED' | 'REVIEWING' | 'OFFER_RELEASED';

const NEXT_STAGE: Partial<Record<string, NextStage>> = {
  ACCEPTED: 'INTERVIEW_SCHEDULED',
  INTERVIEW_SCHEDULED: 'REVIEWING',
  REVIEWING: 'OFFER_RELEASED',
};

const NEXT_STAGE_LABEL: Record<NextStage, string> = {
  INTERVIEW_SCHEDULED: 'Schedule interview',
  REVIEWING: 'Move to review',
  OFFER_RELEASED: 'Release offer',
};

const COMPANY_OWNED_STAGES = new Set(['ACCEPTED', 'INTERVIEW_SCHEDULED', 'REVIEWING']);

export function OpportunitiesTab({ companyId, token }: { companyId: string; token: string }) {
  const [opportunities, setOpportunities] = useState<OpportunityWithJobAndProfessional[] | null>(
    null,
  );
  const [score, setScore] = useState<ResponsivenessScore | null>(null);

  function load() {
    apiFetch<OpportunityWithJobAndProfessional[]>(`/companies/${companyId}/opportunities`, {
      token,
    }).then(setOpportunities);
    apiFetch<ResponsivenessScore>(`/companies/${companyId}/responsiveness`, { token }).then(
      setScore,
    );
  }

  useEffect(load, [companyId, token]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[14px] text-fg-muted">
          Every opportunity you&rsquo;ve sent, across all your jobs.
        </p>
        {score && (
          <div className="rounded-lg border border-line-strong bg-canvas px-3 py-1.5">
            <span className="text-[12.5px] text-fg-muted">Response rate (private): </span>
            <span className="text-[12.5px] font-medium text-fg">
              {score.rate === null
                ? `not enough data yet (${score.totalConsidered}/5)`
                : `${Math.round(score.rate * 100)}% of ${score.totalConsidered}`}
            </span>
          </div>
        )}
      </div>

      {opportunities === null ? (
        <div className="h-32 animate-pulse rounded-2xl bg-surface" />
      ) : opportunities.length === 0 ? (
        <Card className="px-6 py-14 text-center">
          <p className="text-[14.5px] text-fg-muted">No opportunities sent yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {opportunities.map((opportunity) => (
            <OpportunityRow
              key={opportunity.id}
              opportunity={opportunity}
              token={token}
              onChanged={load}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function OpportunityRow({
  opportunity,
  token,
  onChanged,
}: {
  opportunity: OpportunityWithJobAndProfessional;
  token: string;
  onChanged: () => void;
}) {
  const [panel, setPanel] = useState<'none' | 'advance'>('none');
  const [error, setError] = useState<string | null>(null);
  const { requestConfirm, dialog } = useConfirmDialog();

  const stage = opportunity.displayStatus.stage;
  const nextStage = NEXT_STAGE[stage];
  const canAct = opportunity.status === 'ACCEPTED' && COMPANY_OWNED_STAGES.has(stage);

  async function reject() {
    setError(null);
    try {
      await apiFetch(`/opportunities/${opportunity.id}/pipeline`, {
        method: 'POST',
        token,
        body: { stage: 'REJECTED' },
      });
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to reject');
    }
  }

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <User className="h-4 w-4 text-fg-faint" />
          <div>
            <p className="text-[14.5px] font-medium text-fg">{opportunity.professionalFullName}</p>
            <p className="text-[12.5px] text-fg-faint">{opportunity.jobTitle}</p>
          </div>
        </div>
        <Badge tone={opportunity.status === 'ACCEPTED' ? 'emerald' : 'neutral'}>
          {formatEnum(opportunity.status)}
        </Badge>
      </div>

      {opportunity.status === 'ACCEPTED' && (
        <div className="mt-3.5 rounded-xl border border-line bg-canvas px-3.5 py-3">
          <PipelineStepper displayStatus={opportunity.displayStatus} perspective="company" />
        </div>
      )}

      {opportunity.status === 'ACCEPTED' && (
        <ContactMethodsReveal opportunityId={opportunity.id} token={token} />
      )}

      {error && <p className="mt-3 text-[13px] text-rose-600 dark:text-rose-500">{error}</p>}

      {canAct && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
          {nextStage && (
            <Button size="sm" onClick={() => setPanel(panel === 'advance' ? 'none' : 'advance')}>
              {NEXT_STAGE_LABEL[nextStage]}
            </Button>
          )}
          <Button
            size="sm"
            variant="secondary"
            onClick={() =>
              requestConfirm({
                title: 'Reject this candidate?',
                description: `${opportunity.professionalFullName} will see this opportunity as closed.`,
                onConfirm: reject,
              })
            }
          >
            Reject
          </Button>
        </div>
      )}

      {panel === 'advance' && nextStage && (
        <div className="mt-4">
          <AdvanceStageForm
            opportunityId={opportunity.id}
            token={token}
            targetStage={nextStage}
            onDone={() => {
              setPanel('none');
              onChanged();
            }}
            onCancel={() => setPanel('none')}
          />
        </div>
      )}

      {dialog}
    </Card>
  );
}

function ContactMethodsReveal({ opportunityId, token }: { opportunityId: string; token: string }) {
  const [methods, setMethods] = useState<ContactMethod[] | null>(null);
  const [open, setOpen] = useState(false);

  function reveal() {
    setOpen(true);
    if (!methods) {
      apiFetch<ContactMethod[]>(`/opportunities/${opportunityId}/contact-methods`, {
        token,
      }).then(setMethods);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={reveal}
        className="mt-2.5 inline-flex items-center gap-1.5 text-[13px] font-medium text-emerald-600 hover:underline dark:text-emerald-400"
      >
        <Mail className="h-3.5 w-3.5" /> View contact info
      </button>
    );
  }

  return (
    <div className="mt-2.5 rounded-lg bg-canvas px-3.5 py-2.5">
      {methods === null ? (
        <div className="h-4 w-32 animate-pulse rounded bg-surface" />
      ) : methods.length === 0 ? (
        <p className="text-[13px] text-fg-faint">No contact methods on file.</p>
      ) : (
        <dl className="space-y-1">
          {methods.map((method) => (
            <div key={method.id} className="flex items-center gap-2 text-[13px]">
              <dt className="text-fg-faint">{formatEnum(method.type)}:</dt>
              <dd className="text-fg">{method.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function AdvanceStageForm({
  opportunityId,
  token,
  targetStage,
  onDone,
  onCancel,
}: {
  opportunityId: string;
  token: string;
  targetStage: NextStage;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [scheduledAt, setScheduledAt] = useState('');
  const [windowDays, setWindowDays] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await apiFetch(`/opportunities/${opportunityId}/pipeline`, {
        method: 'POST',
        token,
        body: {
          stage: targetStage,
          notes: notes || undefined,
          scheduledAt:
            targetStage === 'INTERVIEW_SCHEDULED' && scheduledAt
              ? new Date(scheduledAt).toISOString()
              : undefined,
          windowDays:
            targetStage === 'OFFER_RELEASED' && windowDays ? Number(windowDays) : undefined,
        },
      });
      onDone();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update the pipeline');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-line bg-canvas p-4">
      {targetStage === 'INTERVIEW_SCHEDULED' && (
        <div>
          <Label htmlFor={`scheduledAt-${opportunityId}`}>Interview date</Label>
          <Input
            id={`scheduledAt-${opportunityId}`}
            type="date"
            required
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />
        </div>
      )}
      {targetStage === 'OFFER_RELEASED' && (
        <div>
          <Label htmlFor={`windowDays-${opportunityId}`}>
            Response window (days, optional — defaults to your company setting)
          </Label>
          <Input
            id={`windowDays-${opportunityId}`}
            type="number"
            min={7}
            max={60}
            placeholder="14"
            value={windowDays}
            onChange={(e) => setWindowDays(e.target.value)}
          />
        </div>
      )}
      <div>
        <Label htmlFor={`notes-${opportunityId}`}>Notes (optional)</Label>
        <Textarea
          id={`notes-${opportunityId}`}
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      {error && <p className="text-[13px] text-rose-600 dark:text-rose-500">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : NEXT_STAGE_LABEL[targetStage]}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
