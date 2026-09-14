'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Send } from 'lucide-react';

import { ApiError, apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Company, Job } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

export function SendOpportunityButton({
  professionalProfileId,
}: {
  professionalProfileId: string;
}) {
  const { user, accessToken } = useAuth();
  const [companies, setCompanies] = useState<Company[] | null>(null);
  const [companyId, setCompanyId] = useState('');
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [jobId, setJobId] = useState('');
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!accessToken) return;

    apiFetch<Company[]>('/companies/mine', { token: accessToken })
      .then((list) => {
        setCompanies(list);
        if (list.length > 0) setCompanyId(list[0].id);
      })
      .catch(() => setCompanies([]));
  }, [accessToken]);

  useEffect(() => {
    if (!companyId) {
      setJobs(null);
      return;
    }

    apiFetch<Job[]>(`/companies/${companyId}/jobs`)
      .then((list) => {
        const active = list.filter((job) => job.status === 'ACTIVE');
        setJobs(active);
        setJobId(active[0]?.id ?? '');
      })
      .catch(() => setJobs([]));
  }, [companyId]);

  if (!user || companies === null || companies.length === 0) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!jobId) return;

    setError(null);
    setIsSubmitting(true);

    try {
      await apiFetch(`/jobs/${jobId}/opportunities`, {
        method: 'POST',
        token: accessToken,
        body: { professionalProfileId, message: message.trim() || undefined },
      });
      setSent(true);
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send opportunity');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (sent) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-emerald-600 dark:text-emerald-400">
        <Send className="h-3.5 w-3.5" /> Opportunity sent
      </span>
    );
  }

  if (!isOpen) {
    return (
      <Button type="button" size="sm" variant="secondary" onClick={() => setIsOpen(true)}>
        <Send className="h-3.5 w-3.5" /> Send opportunity
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm space-y-2 rounded-xl border border-line-strong bg-canvas p-3"
    >
      {companies.length > 1 && (
        <Select value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.displayName}
            </option>
          ))}
        </Select>
      )}

      {jobs === null ? (
        <div className="h-9 animate-pulse rounded-xl bg-surface" />
      ) : jobs.length === 0 ? (
        <p className="text-[13px] text-fg-faint">
          No active job openings for this company.{' '}
          <Link
            href={`/companies/${companyId}/manage`}
            className="font-medium text-fg hover:underline"
          >
            Post one
          </Link>
          .
        </p>
      ) : (
        <>
          <Select value={jobId} onChange={(e) => setJobId(e.target.value)}>
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title}
              </option>
            ))}
          </Select>
          <Textarea
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Message (optional)"
            className="text-[13.5px]"
          />
          {error && <p className="text-[12px] text-rose-600 dark:text-rose-500">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Sending…' : 'Send'}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
          </div>
        </>
      )}
    </form>
  );
}
