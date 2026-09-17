'use client';

import { useState, type FormEvent } from 'react';

import { ApiError, apiFetch } from '@/lib/api';
import { COMPANY_TYPES, formatEnum } from '@/lib/enums';
import type { Company } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input, Label, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

export function OverviewTab({
  company,
  token,
  onSaved,
}: {
  company: Company;
  token: string;
  onSaved: (company: Company) => void;
}) {
  const [displayName, setDisplayName] = useState(company.displayName);
  const [legalName, setLegalName] = useState(company.legalName);
  const [companyType, setCompanyType] = useState(company.companyType);
  const [industry, setIndustry] = useState(company.industry ?? '');
  const [website, setWebsite] = useState(company.website ?? '');
  const [description, setDescription] = useState(company.description ?? '');
  const [defaultResponseWindowDays, setDefaultResponseWindowDays] = useState(
    company.defaultResponseWindowDays?.toString() ?? '',
  );
  const [defaultOfferWindowDays, setDefaultOfferWindowDays] = useState(
    company.defaultOfferWindowDays?.toString() ?? '',
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setIsSubmitting(true);

    try {
      const updated = await apiFetch<Company>(`/companies/${company.id}`, {
        method: 'PATCH',
        token,
        body: {
          displayName,
          legalName,
          companyType,
          industry: industry || undefined,
          website: website || undefined,
          description: description || undefined,
          defaultResponseWindowDays: defaultResponseWindowDays
            ? Number(defaultResponseWindowDays)
            : undefined,
          defaultOfferWindowDays: defaultOfferWindowDays
            ? Number(defaultOfferWindowDays)
            : undefined,
        },
      });
      onSaved(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save changes');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="displayName">Display name</Label>
          <Input
            id="displayName"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="legalName">Legal name</Label>
          <Input
            id="legalName"
            required
            value={legalName}
            onChange={(e) => setLegalName(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="companyType">Company type</Label>
          <Select
            id="companyType"
            value={companyType}
            onChange={(e) => setCompanyType(e.target.value)}
          >
            {COMPANY_TYPES.map((type) => (
              <option key={type} value={type}>
                {formatEnum(type)}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="industry">Industry</Label>
          <Input id="industry" value={industry} onChange={(e) => setIndustry(e.target.value)} />
        </div>
      </div>

      <div>
        <Label htmlFor="website">Website</Label>
        <Input
          id="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="border-t border-line pt-4">
        <Label>Response windows</Label>
        <p className="mb-2 text-[12px] text-fg-faint">
          How long professionals get to respond, by default. Overridable per opportunity or offer.
          Leave blank to use the platform default (30 days / 14 days).
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="defaultResponseWindowDays">Opportunity response window (days)</Label>
            <Input
              id="defaultResponseWindowDays"
              type="number"
              min={7}
              max={60}
              placeholder="30"
              value={defaultResponseWindowDays}
              onChange={(e) => setDefaultResponseWindowDays(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="defaultOfferWindowDays">Offer response window (days)</Label>
            <Input
              id="defaultOfferWindowDays"
              type="number"
              min={7}
              max={60}
              placeholder="14"
              value={defaultOfferWindowDays}
              onChange={(e) => setDefaultOfferWindowDays(e.target.value)}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-rose-100 px-3.5 py-3 text-[13.5px] text-rose-600 dark:bg-rose-600/10 dark:text-rose-500">
          {error}
        </div>
      )}
      {saved && !error && (
        <p className="text-[13.5px] text-emerald-600 dark:text-emerald-400">Saved.</p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  );
}
