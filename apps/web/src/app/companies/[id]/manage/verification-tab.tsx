'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Clock, ShieldAlert, ShieldCheck, XCircle } from 'lucide-react';

import { ApiError, apiFetch } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/input';

interface Verification {
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
  businessRegistrationNumber: string | null;
  taxIdentificationNumber: string | null;
  rejectionReason: string | null;
}

export function VerificationTab({ companyId, token }: { companyId: string; token: string }) {
  const [verification, setVerification] = useState<Verification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState('');
  const [taxIdentificationNumber, setTaxIdentificationNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    apiFetch<Verification>(`/companies/${companyId}/verification`, { token })
      .then((v) => {
        setVerification(v);
        setBusinessRegistrationNumber(v.businessRegistrationNumber ?? '');
        setTaxIdentificationNumber(v.taxIdentificationNumber ?? '');
      })
      .catch(() => setVerification(null))
      .finally(() => setIsLoading(false));
  }, [companyId, token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const updated = await apiFetch<Verification>(`/companies/${companyId}/verification`, {
        method: 'PUT',
        token,
        body: { businessRegistrationNumber, taxIdentificationNumber },
      });
      setVerification(updated);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to submit verification');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <div className="h-20 animate-pulse rounded-xl bg-canvas" />;
  }

  return (
    <div className="space-y-5">
      <div>
        {verification?.verificationStatus === 'VERIFIED' ? (
          <Badge tone="emerald">
            <ShieldCheck className="h-3 w-3" /> Verified
          </Badge>
        ) : verification?.verificationStatus === 'REJECTED' ? (
          <Badge tone="rose">
            <XCircle className="h-3 w-3" /> Rejected
          </Badge>
        ) : verification ? (
          <Badge tone="gold">
            <Clock className="h-3 w-3" /> Pending review
          </Badge>
        ) : (
          <Badge>
            <ShieldAlert className="h-3 w-3" /> Not submitted
          </Badge>
        )}
        {verification?.rejectionReason && (
          <p className="mt-2 text-[13px] text-rose-600 dark:text-rose-500">
            {verification.rejectionReason}
          </p>
        )}
      </div>

      {verification?.verificationStatus !== 'VERIFIED' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-[14px] text-fg-muted">
            Submit business details to get the verified badge on your public profile.
          </p>
          <div>
            <Label htmlFor="businessRegistrationNumber">Business registration number</Label>
            <Input
              id="businessRegistrationNumber"
              value={businessRegistrationNumber}
              onChange={(e) => setBusinessRegistrationNumber(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="taxIdentificationNumber">Tax identification number</Label>
            <Input
              id="taxIdentificationNumber"
              value={taxIdentificationNumber}
              onChange={(e) => setTaxIdentificationNumber(e.target.value)}
            />
          </div>
          {error && <p className="text-[13px] text-rose-600 dark:text-rose-500">{error}</p>}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting…' : verification ? 'Resubmit' : 'Submit for verification'}
          </Button>
        </form>
      )}
    </div>
  );
}
