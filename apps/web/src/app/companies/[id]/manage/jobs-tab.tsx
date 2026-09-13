'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Briefcase, Plus, Send, Users } from 'lucide-react';

import { ApiError, apiFetch } from '@/lib/api';
import { EMPLOYMENT_TYPES, formatEnum, WORK_MODES } from '@/lib/enums';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Input, Label, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

interface Job {
  id: string;
  title: string;
  description: string;
  employmentType: string;
  workMode: string;
  status: string;
}

interface Opportunity {
  id: string;
  professionalProfileId: string;
  status: string;
  message: string | null;
}

export function JobsTab({ companyId, token }: { companyId: string; token: string }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  function load() {
    apiFetch<Job[]>(`/companies/${companyId}/jobs`)
      .then(setJobs)
      .finally(() => setIsLoading(false));
  }

  useEffect(load, [companyId]);

  async function closeJob(jobId: string) {
    await apiFetch(`/companies/${companyId}/jobs/${jobId}`, {
      method: 'PATCH',
      token,
      body: { status: 'CLOSED' },
    });
    load();
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[14px] text-fg-muted">
          Post roles, then send opportunities directly to professionals.
        </p>
        {!isAdding && (
          <Button size="sm" variant="secondary" onClick={() => setIsAdding(true)}>
            <Plus className="h-3.5 w-3.5" /> Post a job
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="mb-4">
          <AddJobForm
            companyId={companyId}
            token={token}
            onCancel={() => setIsAdding(false)}
            onSaved={() => {
              setIsAdding(false);
              load();
            }}
          />
        </div>
      )}

      {isLoading ? (
        <div className="h-20 animate-pulse rounded-xl bg-canvas" />
      ) : jobs.length === 0 ? (
        <p className="text-[14px] text-fg-faint">No jobs posted yet.</p>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} token={token} onClose={() => closeJob(job.id)} />
          ))}
        </div>
      )}
    </div>
  );
}

function JobCard({ job, token, onClose }: { job: Job; token: string; onClose: () => void }) {
  const [panel, setPanel] = useState<'none' | 'send' | 'view'>('none');

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-fg-faint" />
            <h3 className="text-[15px] font-medium tracking-[-0.01em] text-fg">{job.title}</h3>
          </div>
          <p className="mt-1 text-[13px] text-fg-muted">
            {formatEnum(job.employmentType)} · {formatEnum(job.workMode)}
          </p>
        </div>
        <Badge tone={job.status === 'ACTIVE' ? 'emerald' : 'neutral'}>
          {formatEnum(job.status)}
        </Badge>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setPanel(panel === 'send' ? 'none' : 'send')}
          disabled={job.status !== 'ACTIVE'}
        >
          <Send className="h-3.5 w-3.5" /> Send opportunity
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setPanel(panel === 'view' ? 'none' : 'view')}
        >
          <Users className="h-3.5 w-3.5" /> View opportunities
        </Button>
        {job.status === 'ACTIVE' && (
          <Button size="sm" variant="ghost" onClick={onClose}>
            Close job
          </Button>
        )}
      </div>

      {panel === 'send' && (
        <div className="mt-4">
          <SendOpportunityForm jobId={job.id} token={token} onSent={() => setPanel('none')} />
        </div>
      )}
      {panel === 'view' && (
        <div className="mt-4">
          <OpportunityList jobId={job.id} token={token} />
        </div>
      )}
    </Card>
  );
}

function SendOpportunityForm({
  jobId,
  token,
  onSent,
}: {
  jobId: string;
  token: string;
  onSent: () => void;
}) {
  const [professionalProfileId, setProfessionalProfileId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await apiFetch(`/jobs/${jobId}/opportunities`, {
        method: 'POST',
        token,
        body: { professionalProfileId, message: message || undefined },
      });
      onSent();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to send opportunity');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-line bg-canvas p-4">
      <div>
        <Label htmlFor={`profile-${jobId}`}>Professional profile ID</Label>
        <Input
          id={`profile-${jobId}`}
          required
          value={professionalProfileId}
          onChange={(e) => setProfessionalProfileId(e.target.value)}
          placeholder="Paste their profile ID"
        />
        <p className="mt-1 text-[12px] text-fg-faint">
          Professional discovery/search isn&rsquo;t built yet — paste an ID directly for now.
        </p>
      </div>
      <div>
        <Label htmlFor={`message-${jobId}`}>Message (optional)</Label>
        <Textarea
          id={`message-${jobId}`}
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>
      {error && <p className="text-[13px] text-rose-600 dark:text-rose-500">{error}</p>}
      <Button type="submit" size="sm" disabled={isSubmitting}>
        {isSubmitting ? 'Sending…' : 'Send opportunity'}
      </Button>
    </form>
  );
}

function OpportunityList({ jobId, token }: { jobId: string; token: string }) {
  const [opportunities, setOpportunities] = useState<Opportunity[] | null>(null);

  useEffect(() => {
    apiFetch<Opportunity[]>(`/jobs/${jobId}/opportunities`, { token }).then(setOpportunities);
  }, [jobId, token]);

  if (!opportunities) {
    return <div className="h-12 animate-pulse rounded-xl bg-canvas" />;
  }

  if (opportunities.length === 0) {
    return <p className="text-[13.5px] text-fg-faint">No opportunities sent for this job yet.</p>;
  }

  return (
    <div className="space-y-2">
      {opportunities.map((opp) => (
        <div
          key={opp.id}
          className="flex items-center justify-between rounded-xl border border-line bg-canvas px-3.5 py-2.5"
        >
          <span className="font-mono text-[12.5px] text-fg-muted">{opp.professionalProfileId}</span>
          <Badge
            tone={
              opp.status === 'ACCEPTED'
                ? 'emerald'
                : opp.status === 'DECLINED' || opp.status === 'EXPIRED'
                  ? 'rose'
                  : 'neutral'
            }
          >
            {formatEnum(opp.status)}
          </Badge>
        </div>
      ))}
    </div>
  );
}

function AddJobForm({
  companyId,
  token,
  onCancel,
  onSaved,
}: {
  companyId: string;
  token: string;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [employmentType, setEmploymentType] =
    useState<(typeof EMPLOYMENT_TYPES)[number]>('FULL_TIME');
  const [workMode, setWorkMode] = useState<(typeof WORK_MODES)[number]>('REMOTE');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await apiFetch(`/companies/${companyId}/jobs`, {
        method: 'POST',
        token,
        body: { title, description, employmentType, workMode },
      });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to post job');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardBody className="pt-5">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              required
              minLength={4}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              required
              minLength={20}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
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
          {error && <p className="text-[13px] text-rose-600 dark:text-rose-500">{error}</p>}
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Posting…' : 'Post job'}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
