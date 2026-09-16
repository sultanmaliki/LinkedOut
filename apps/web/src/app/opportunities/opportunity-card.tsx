'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Briefcase, Clock, Flag, GitBranch } from 'lucide-react';

import { ApiError, apiFetch } from '@/lib/api';
import { formatEnum } from '@/lib/enums';
import type { Company, Job, Opportunity } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PipelineStepper } from '@/components/pipeline-stepper';
import { OfferResponseForm } from './offer-response-form';
import { PipelineView } from './pipeline-view';
import { RespondForm } from './respond-form';

const statusTone: Record<Opportunity['status'], 'neutral' | 'emerald' | 'gold' | 'rose'> = {
  PENDING: 'gold',
  ACCEPTED: 'emerald',
  DECLINED: 'rose',
  EXPIRED: 'neutral',
  WITHDRAWN: 'neutral',
};

const WITHDRAW_WINDOW_MS = 24 * 60 * 60 * 1000;

export function OpportunityCard({
  opportunity,
  token,
  onChanged,
}: {
  opportunity: Opportunity;
  token: string;
  onChanged: () => void;
}) {
  const [job, setJob] = useState<Job | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [panel, setPanel] = useState<'none' | 'respond' | 'offer' | 'pipeline'>('none');
  const [error, setError] = useState<string | null>(null);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isFlagging, setIsFlagging] = useState(false);

  useEffect(() => {
    apiFetch<Job>(`/jobs/${opportunity.jobId}`)
      .then((jobData) => {
        setJob(jobData);
        return apiFetch<Company>(`/companies/${jobData.companyId}`);
      })
      .then(setCompany)
      .catch(() => setError('Failed to load job details'));
  }, [opportunity.jobId]);

  const canWithdraw =
    opportunity.status === 'ACCEPTED' &&
    opportunity.acceptedAt &&
    Date.now() - new Date(opportunity.acceptedAt).getTime() <= WITHDRAW_WINDOW_MS;

  async function handleWithdraw() {
    setIsWithdrawing(true);
    try {
      await apiFetch(`/professionals/me/opportunities/${opportunity.id}/withdraw`, {
        method: 'POST',
        token,
      });
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to withdraw');
    } finally {
      setIsWithdrawing(false);
    }
  }

  async function handleFlagUnresponsive() {
    setIsFlagging(true);
    try {
      await apiFetch(`/professionals/me/opportunities/${opportunity.id}/flag-unresponsive`, {
        method: 'POST',
        token,
      });
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to flag as unresponsive');
    } finally {
      setIsFlagging(false);
    }
  }

  const { displayStatus } = opportunity;
  const canRespondToOffer = displayStatus.stage === 'OFFER_RELEASED';
  const canFlagUnresponsive =
    displayStatus.ownedBy === 'company' &&
    (displayStatus.tier === 'softFlag' || displayStatus.tier === 'hardClosed') &&
    !opportunity.manuallyFlaggedUnresponsiveAt;

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-fg-faint" />
            {job ? (
              <h3 className="text-[15px] font-medium tracking-[-0.01em] text-fg">{job.title}</h3>
            ) : (
              <div className="h-4 w-40 animate-pulse rounded bg-canvas" />
            )}
          </div>
          {company && (
            <Link
              href={`/companies/${company.id}`}
              className="mt-1 inline-block text-[13.5px] text-fg-muted hover:text-fg hover:underline"
            >
              {company.displayName}
            </Link>
          )}
          <p className="mt-1 flex items-center gap-1 text-[12px] text-fg-faint">
            <Clock className="h-3 w-3" />
            Sent{' '}
            {new Date(opportunity.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
        <Badge tone={statusTone[opportunity.status]}>{formatEnum(opportunity.status)}</Badge>
      </div>

      {opportunity.message && (
        <p className="mt-3 rounded-lg bg-canvas px-3.5 py-2.5 text-[13.5px] text-fg-muted">
          &ldquo;{opportunity.message}&rdquo;
        </p>
      )}

      {opportunity.status === 'ACCEPTED' && (
        <div className="mt-3.5 rounded-xl border border-line bg-canvas px-3.5 py-3">
          <PipelineStepper displayStatus={displayStatus} perspective="professional" />
        </div>
      )}

      {error && <p className="mt-3 text-[13px] text-rose-600 dark:text-rose-500">{error}</p>}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
        {opportunity.status === 'PENDING' && (
          <Button size="sm" onClick={() => setPanel(panel === 'respond' ? 'none' : 'respond')}>
            Respond
          </Button>
        )}
        {canRespondToOffer && (
          <Button size="sm" onClick={() => setPanel(panel === 'offer' ? 'none' : 'offer')}>
            Respond to offer
          </Button>
        )}
        {canWithdraw && (
          <Button size="sm" variant="secondary" onClick={handleWithdraw} disabled={isWithdrawing}>
            {isWithdrawing ? 'Withdrawing…' : 'Withdraw'}
          </Button>
        )}
        {canFlagUnresponsive && (
          <Button
            size="sm"
            variant="secondary"
            onClick={handleFlagUnresponsive}
            disabled={isFlagging}
          >
            <Flag className="h-3.5 w-3.5" /> {isFlagging ? 'Flagging…' : 'Flag as unresponsive'}
          </Button>
        )}
        {opportunity.status !== 'PENDING' && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setPanel(panel === 'pipeline' ? 'none' : 'pipeline')}
          >
            <GitBranch className="h-3.5 w-3.5" /> View history
          </Button>
        )}
      </div>

      {panel === 'respond' && (
        <div className="mt-4">
          <RespondForm
            opportunityId={opportunity.id}
            token={token}
            onResponded={() => {
              setPanel('none');
              onChanged();
            }}
            onCancel={() => setPanel('none')}
          />
        </div>
      )}
      {panel === 'offer' && (
        <div className="mt-4">
          <OfferResponseForm
            opportunityId={opportunity.id}
            token={token}
            onResponded={() => {
              setPanel('none');
              onChanged();
            }}
            onCancel={() => setPanel('none')}
          />
        </div>
      )}
      {panel === 'pipeline' && (
        <div className="mt-4">
          <PipelineView opportunityId={opportunity.id} token={token} />
        </div>
      )}
    </Card>
  );
}
