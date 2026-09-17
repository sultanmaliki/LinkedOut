'use client';

import { useEffect, useState } from 'react';
import { Building2, Check, ShieldCheck, User, X } from 'lucide-react';

import { apiFetch, ApiError } from '@/lib/api';
import { cn } from '@/lib/cn';
import type { PendingCompanyVerification, PendingEmploymentVerification } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/input';

const subTabs = ['Companies', 'Professionals'] as const;
type SubTab = (typeof subTabs)[number];

export function VerificationsPanel({ token }: { token: string }) {
  const [subTab, setSubTab] = useState<SubTab>('Companies');

  return (
    <div>
      <div className="mb-4 flex gap-1">
        {subTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setSubTab(tab)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors',
              subTab === tab ? 'bg-surface text-fg' : 'text-fg-muted hover:text-fg',
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {subTab === 'Companies' ? (
        <CompanyVerificationsList token={token} />
      ) : (
        <ProfessionalVerificationsList token={token} />
      )}
    </div>
  );
}

function RejectForm({
  onReject,
  onCancel,
}: {
  onReject: (reason: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState('');

  return (
    <div className="mt-3 space-y-2 rounded-xl border border-line-strong bg-canvas p-3">
      <Textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Why is this being rejected? (visible in the audit log)"
        rows={2}
        minLength={5}
        className="text-[13.5px]"
      />
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          disabled={reason.trim().length < 5}
          onClick={() => onReject(reason.trim())}
          className="bg-rose-600 text-white hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500"
        >
          Confirm reject
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function CompanyVerificationsList({ token }: { token: string }) {
  const [items, setItems] = useState<PendingCompanyVerification[] | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    apiFetch<PendingCompanyVerification[]>('/moderation/verifications/companies', { token }).then(
      setItems,
    );
  }

  useEffect(load, [token]);

  async function review(id: string, status: 'VERIFIED' | 'REJECTED', rejectionReason?: string) {
    setError(null);
    try {
      await apiFetch(`/moderation/verifications/companies/${id}`, {
        method: 'PATCH',
        token,
        body: { status, rejectionReason },
      });
      setRejectingId(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to review verification');
    }
  }

  if (items === null) {
    return <div className="h-32 animate-pulse rounded-2xl bg-surface" />;
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-[13px] text-rose-600 dark:text-rose-500">{error}</p>}

      {items.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <ShieldCheck className="h-7 w-7 text-fg-faint" strokeWidth={1.5} />
          <p className="text-[14.5px] text-fg-muted">No company verifications pending.</p>
        </Card>
      ) : (
        items.map((item) => (
          <Card key={item.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Building2 className="h-4 w-4 text-fg-faint" />
                <div>
                  <p className="text-[14.5px] font-medium text-fg">{item.companyDisplayName}</p>
                  <p className="text-[12.5px] text-fg-faint">{item.companyLegalName}</p>
                </div>
              </div>
              <Badge tone="gold">PENDING</Badge>
            </div>

            <dl className="mt-3 grid gap-1.5 text-[13px] text-fg-muted sm:grid-cols-2">
              {item.businessRegistrationNumber && (
                <div>
                  <dt className="text-fg-faint">Business registration #</dt>
                  <dd>{item.businessRegistrationNumber}</dd>
                </div>
              )}
              {item.taxIdentificationNumber && (
                <div>
                  <dt className="text-fg-faint">Tax ID</dt>
                  <dd>{item.taxIdentificationNumber}</dd>
                </div>
              )}
              {item.verificationDocumentUrl && (
                <div className="sm:col-span-2">
                  <dt className="text-fg-faint">Document</dt>
                  <dd>
                    <a
                      href={item.verificationDocumentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 hover:underline dark:text-emerald-400"
                    >
                      View document
                    </a>
                  </dd>
                </div>
              )}
            </dl>

            {rejectingId === item.id ? (
              <RejectForm
                onReject={(reason) => review(item.id, 'REJECTED', reason)}
                onCancel={() => setRejectingId(null)}
              />
            ) : (
              <div className="mt-4 flex gap-2 border-t border-line pt-3">
                <Button size="sm" onClick={() => review(item.id, 'VERIFIED')}>
                  <Check className="h-3.5 w-3.5" /> Approve
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setRejectingId(item.id)}>
                  <X className="h-3.5 w-3.5" /> Reject
                </Button>
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  );
}

function ProfessionalVerificationsList({ token }: { token: string }) {
  const [items, setItems] = useState<PendingEmploymentVerification[] | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function load() {
    apiFetch<PendingEmploymentVerification[]>('/moderation/verifications/professionals', {
      token,
    }).then(setItems);
  }

  useEffect(load, [token]);

  async function review(id: string, status: 'VERIFIED' | 'REJECTED', rejectionReason?: string) {
    setError(null);
    try {
      await apiFetch(`/moderation/verifications/professionals/${id}`, {
        method: 'PATCH',
        token,
        body: { status, rejectionReason },
      });
      setRejectingId(null);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to review verification');
    }
  }

  if (items === null) {
    return <div className="h-32 animate-pulse rounded-2xl bg-surface" />;
  }

  return (
    <div className="space-y-3">
      {error && <p className="text-[13px] text-rose-600 dark:text-rose-500">{error}</p>}

      {items.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <ShieldCheck className="h-7 w-7 text-fg-faint" strokeWidth={1.5} />
          <p className="text-[14.5px] text-fg-muted">No employment verifications pending.</p>
        </Card>
      ) : (
        items.map((item) => (
          <Card key={item.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-fg-faint" />
                <div>
                  <p className="text-[14.5px] font-medium text-fg">{item.professionalFullName}</p>
                  <p className="text-[12.5px] text-fg-faint">
                    {item.jobTitle} at {item.companyName}
                  </p>
                </div>
              </div>
              <Badge tone="gold">PENDING</Badge>
            </div>

            <dl className="mt-3 grid gap-1.5 text-[13px] text-fg-muted sm:grid-cols-2">
              {item.companyEmail && (
                <div>
                  <dt className="text-fg-faint">Company email</dt>
                  <dd>{item.companyEmail}</dd>
                </div>
              )}
              {item.employeeId && (
                <div>
                  <dt className="text-fg-faint">Employee ID</dt>
                  <dd>{item.employeeId}</dd>
                </div>
              )}
              {item.idCardUrl && (
                <div className="sm:col-span-2">
                  <dt className="text-fg-faint">ID card</dt>
                  <dd>
                    <a
                      href={item.idCardUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 hover:underline dark:text-emerald-400"
                    >
                      View document
                    </a>
                  </dd>
                </div>
              )}
            </dl>

            <p className="mt-2 text-[12.5px] text-fg-faint">
              This only confirms employment at &ldquo;{item.companyName}&rdquo; as typed by the
              professional -- cross-check it plausibly matches a real company before approving.
            </p>

            {rejectingId === item.id ? (
              <RejectForm
                onReject={(reason) => review(item.id, 'REJECTED', reason)}
                onCancel={() => setRejectingId(null)}
              />
            ) : (
              <div className="mt-4 flex gap-2 border-t border-line pt-3">
                <Button size="sm" onClick={() => review(item.id, 'VERIFIED')}>
                  <Check className="h-3.5 w-3.5" /> Approve
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setRejectingId(item.id)}>
                  <X className="h-3.5 w-3.5" /> Reject
                </Button>
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
