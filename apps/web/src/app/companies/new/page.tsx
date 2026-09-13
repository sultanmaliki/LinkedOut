'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import { ApiError, apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { COMPANY_TYPES, formatEnum } from '@/lib/enums';
import type { Company } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Input, Label, Textarea } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

export default function NewCompanyPage() {
  const router = useRouter();
  const { accessToken, isLoading: isAuthLoading } = useAuth();

  const [legalName, setLegalName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [companyType, setCompanyType] = useState<(typeof COMPANY_TYPES)[number]>('STARTUP');
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !accessToken) {
      router.replace('/auth');
    }
  }, [accessToken, isAuthLoading, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const company = await apiFetch<Company>('/companies', {
        method: 'POST',
        token: accessToken,
        body: {
          legalName,
          displayName,
          companyType,
          industry: industry || undefined,
          description: description || undefined,
          website: website || undefined,
        },
      });
      router.push(`/companies/${company.id}/manage`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to create company');
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-14">
      <h1 className="mb-1 font-display text-[24px] font-medium tracking-[-0.01em] text-fg">
        Create your company profile
      </h1>
      <p className="mb-6 text-[14px] text-fg-muted">
        You&rsquo;ll be the first admin. You can invite teammates and submit verification after
        this.
      </p>

      <Card>
        <CardBody className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="displayName">Display name</Label>
              <Input
                id="displayName"
                required
                minLength={2}
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Acme"
              />
            </div>
            <div>
              <Label htmlFor="legalName">Legal name</Label>
              <Input
                id="legalName"
                required
                minLength={2}
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="Acme Corporation Ltd."
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="companyType">Company type</Label>
                <Select
                  id="companyType"
                  value={companyType}
                  onChange={(e) => setCompanyType(e.target.value as typeof companyType)}
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
                <Input
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Software"
                />
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
                placeholder="What does your company do?"
              />
            </div>

            {error && (
              <div className="rounded-xl bg-rose-100 px-3.5 py-3 text-[13.5px] text-rose-600 dark:bg-rose-600/10 dark:text-rose-500">
                {error}
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating…' : 'Create company'}
            </Button>
          </form>
        </CardBody>
      </Card>
    </main>
  );
}
