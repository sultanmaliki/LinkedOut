'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  PartyPopper,
  Plus,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from 'lucide-react';

import { ApiError, apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { EMPLOYMENT_TYPES, formatEnum, WORK_MODES } from '@/lib/enums';
import type { EmploymentHistory, EmploymentVerification, Opportunity } from '@/lib/types';
import { ProfileNav } from '@/components/profile-nav';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

type HistoryWithVerification = EmploymentHistory & { verification: EmploymentVerification | null };

export default function EmploymentPage() {
  const router = useRouter();
  const { accessToken, isLoading: isAuthLoading } = useAuth();

  const [entries, setEntries] = useState<HistoryWithVerification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [hasNewOffer, setHasNewOffer] = useState(false);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setIsLoading(true);

    try {
      const history = await apiFetch<EmploymentHistory[]>('/professionals/me/employment-history', {
        token: accessToken,
      });

      const withVerification = await Promise.all(
        history.map(async (entry) => {
          try {
            const verification = await apiFetch<EmploymentVerification>(
              `/professionals/me/employment-history/${entry.id}/verification`,
              { token: accessToken },
            );
            return { ...entry, verification };
          } catch {
            return { ...entry, verification: null };
          }
        }),
      );

      setEntries(withVerification);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to load employment history');
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!accessToken) {
      router.replace('/auth');
      return;
    }

    load();

    apiFetch<Opportunity[]>('/professionals/me/opportunities', { token: accessToken })
      .then((list) => setHasNewOffer(list.some((o) => o.displayStatus.stage === 'OFFER_ACCEPTED')))
      .catch(() => {});
  }, [accessToken, isAuthLoading, router, load]);

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <ProfileNav />

      {hasNewOffer && (
        <Card className="mb-6 border-emerald-200 bg-emerald-50 dark:border-emerald-600/30 dark:bg-emerald-600/10">
          <CardBody className="flex items-start gap-3 pt-5">
            <PartyPopper className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <p className="text-[13.5px] text-fg">
              Congrats on the new offer! Once you start, add it below so your profile stays
              accurate.
            </p>
          </CardBody>
        </Card>
      )}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-medium tracking-[-0.01em] text-fg">
            Employment history
          </h1>
          <p className="mt-1 text-[14px] text-fg-muted">
            Reviews require a verified role. Add your history, then submit it for verification.
          </p>
        </div>
        {!isAdding && (
          <Button size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="h-3.5 w-3.5" /> Add role
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="mb-6">
          <AddEntryForm
            token={accessToken!}
            onCancel={() => setIsAdding(false)}
            onSaved={() => {
              setIsAdding(false);
              load();
            }}
          />
        </div>
      )}

      {isLoading ? (
        <div className="h-32 animate-pulse rounded-2xl bg-surface" />
      ) : error ? (
        <Card>
          <CardBody className="pt-6 text-[14.5px] text-fg-muted">{error}</CardBody>
        </Card>
      ) : entries.length === 0 ? (
        <Card>
          <CardBody className="pt-6 text-center text-[14.5px] text-fg-muted">
            No employment history yet. Add a role to get started.
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} token={accessToken!} onChanged={load} />
          ))}
        </div>
      )}
    </main>
  );
}

function statusBadge(verification: EmploymentVerification | null) {
  if (!verification) {
    return (
      <Badge>
        <ShieldAlert className="h-3 w-3" /> Not submitted
      </Badge>
    );
  }
  if (verification.verificationStatus === 'VERIFIED') {
    return (
      <Badge tone="emerald">
        <ShieldCheck className="h-3 w-3" /> Verified
      </Badge>
    );
  }
  if (verification.verificationStatus === 'REJECTED') {
    return (
      <Badge tone="rose">
        <XCircle className="h-3 w-3" /> Rejected
      </Badge>
    );
  }
  return (
    <Badge tone="gold">
      <Clock className="h-3 w-3" /> Pending review
    </Badge>
  );
}

function EntryCard({
  entry,
  token,
  onChanged,
}: {
  entry: HistoryWithVerification;
  token: string;
  onChanged: () => void;
}) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [companyEmail, setCompanyEmail] = useState(entry.verification?.companyEmail ?? '');
  const [employeeId, setEmployeeId] = useState(entry.verification?.employeeId ?? '');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submitVerification(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await apiFetch(`/professionals/me/employment-history/${entry.id}/verification`, {
        method: 'PUT',
        token,
        body: {
          companyEmail: companyEmail || undefined,
          employeeId: employeeId || undefined,
        },
      });
      setIsVerifying(false);
      onChanged();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to submit verification');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardBody className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[15.5px] font-medium tracking-[-0.01em] text-fg">
              {entry.jobTitle} · {entry.companyName}
            </h3>
            <p className="mt-1 text-[13px] text-fg-muted">
              {formatEnum(entry.employmentType)} · {formatEnum(entry.workMode)}
              {entry.location ? ` · ${entry.location}` : ''}
            </p>
            <p className="mt-1 text-[12.5px] text-fg-faint">
              {new Date(entry.startDate).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
              {' — '}
              {entry.currentlyWorking
                ? 'Present'
                : entry.endDate
                  ? new Date(entry.endDate).toLocaleDateString('en-US', {
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—'}
            </p>
          </div>
          {statusBadge(entry.verification)}
        </div>

        {entry.verification?.verificationStatus === 'REJECTED' &&
          entry.verification.rejectionReason && (
            <p className="mt-3 text-[13px] text-rose-600 dark:text-rose-500">
              {entry.verification.rejectionReason}
            </p>
          )}

        {entry.verification?.verificationStatus !== 'VERIFIED' && (
          <div className="mt-4 border-t border-line pt-4">
            {isVerifying ? (
              <form onSubmit={submitVerification} className="space-y-3">
                <div>
                  <Label htmlFor={`email-${entry.id}`}>Work email (optional)</Label>
                  <Input
                    id={`email-${entry.id}`}
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    placeholder="you@company.com"
                  />
                </div>
                <div>
                  <Label htmlFor={`empid-${entry.id}`}>Employee ID (optional)</Label>
                  <Input
                    id={`empid-${entry.id}`}
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                  />
                </div>
                {error && <p className="text-[13px] text-rose-600 dark:text-rose-500">{error}</p>}
                <div className="flex gap-2">
                  <Button type="submit" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting…' : 'Submit for verification'}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsVerifying(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button size="sm" variant="secondary" onClick={() => setIsVerifying(true)}>
                <ShieldCheck className="h-3.5 w-3.5" />
                {entry.verification ? 'Resubmit verification' : 'Submit for verification'}
              </Button>
            )}
          </div>
        )}

        {entry.verification?.verificationStatus === 'VERIFIED' && (
          <p className="mt-4 flex items-center gap-1.5 border-t border-line pt-4 text-[13px] text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" /> You can write a review for this role.
          </p>
        )}
      </CardBody>
    </Card>
  );
}

function AddEntryForm({
  token,
  onCancel,
  onSaved,
}: {
  token: string;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [employmentType, setEmploymentType] =
    useState<(typeof EMPLOYMENT_TYPES)[number]>('FULL_TIME');
  const [workMode, setWorkMode] = useState<(typeof WORK_MODES)[number]>('ONSITE');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentlyWorking, setCurrentlyWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await apiFetch('/professionals/me/employment-history', {
        method: 'POST',
        token,
        body: {
          companyName,
          jobTitle,
          employmentType,
          workMode,
          startDate,
          endDate: currentlyWorking ? undefined : endDate || undefined,
          currentlyWorking,
        },
      });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to add role');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardBody className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="companyName">Company name</Label>
              <Input
                id="companyName"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="jobTitle">Job title</Label>
              <Input
                id="jobTitle"
                required
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="employmentType">Employment type</Label>
              <Select
                id="employmentType"
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value as typeof employmentType)}
              >
                {EMPLOYMENT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {formatEnum(type)}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="workMode">Work mode</Label>
              <Select
                id="workMode"
                value={workMode}
                onChange={(e) => setWorkMode(e.target.value as typeof workMode)}
              >
                {WORK_MODES.map((mode) => (
                  <option key={mode} value={mode}>
                    {formatEnum(mode)}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="startDate">Start date</Label>
              <Input
                id="startDate"
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">End date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                disabled={currentlyWorking}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-[13.5px] text-fg-muted">
            <input
              type="checkbox"
              checked={currentlyWorking}
              onChange={(e) => setCurrentlyWorking(e.target.checked)}
              className="h-4 w-4 rounded border-line-strong accent-emerald-600"
            />
            I currently work here
          </label>

          {error && <p className="text-[13px] text-rose-600 dark:text-rose-500">{error}</p>}

          <div className="flex gap-3">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Add role'}
            </Button>
            <Button type="button" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
