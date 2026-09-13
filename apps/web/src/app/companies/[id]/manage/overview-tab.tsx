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
