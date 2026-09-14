'use client';

import { useEffect, useState, type FormEvent } from 'react';

import { ApiError, apiFetch } from '@/lib/api';
import { EMPLOYMENT_TYPES, formatEnum, NOTICE_PERIODS, WORK_MODES } from '@/lib/enums';
import type { EmploymentExpectation } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

export function EmploymentExpectationSection({ token }: { token: string }) {
  const [desiredJobTitle, setDesiredJobTitle] = useState('');
  const [employmentType, setEmploymentType] =
    useState<(typeof EMPLOYMENT_TYPES)[number]>('FULL_TIME');
  const [workMode, setWorkMode] = useState<(typeof WORK_MODES)[number]>('REMOTE');
  const [expectedSalaryMin, setExpectedSalaryMin] = useState('');
  const [expectedSalaryMax, setExpectedSalaryMax] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [noticePeriod, setNoticePeriod] = useState<(typeof NOTICE_PERIODS)[number]>('NEGOTIABLE');
  const [openToRelocation, setOpenToRelocation] = useState(false);
  const [activelyLooking, setActivelyLooking] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    apiFetch<EmploymentExpectation | null>('/professionals/me/employment-expectation', {
      token,
    })
      .then((expectation) => {
        if (!expectation) return;
        setDesiredJobTitle(expectation.desiredJobTitle);
        setEmploymentType(expectation.employmentType as (typeof EMPLOYMENT_TYPES)[number]);
        setWorkMode(expectation.workMode as (typeof WORK_MODES)[number]);
        setExpectedSalaryMin(expectation.expectedSalaryMin?.toString() ?? '');
        setExpectedSalaryMax(expectation.expectedSalaryMax?.toString() ?? '');
        setCurrency(expectation.currency);
        setNoticePeriod(expectation.noticePeriod);
        setOpenToRelocation(expectation.openToRelocation);
        setActivelyLooking(expectation.activelyLooking);
      })
      .catch(() => {
        // GET can 404 if the profile itself is missing; leave the form at its defaults.
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setIsSaving(true);

    try {
      await apiFetch('/professionals/me/employment-expectation', {
        method: 'PUT',
        token,
        body: {
          desiredJobTitle,
          employmentType,
          workMode,
          expectedSalaryMin: expectedSalaryMin ? Number(expectedSalaryMin) : undefined,
          expectedSalaryMax: expectedSalaryMax ? Number(expectedSalaryMax) : undefined,
          currency,
          noticePeriod,
          openToRelocation,
          activelyLooking,
        },
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardBody className="pt-5">
          <div className="h-40 animate-pulse rounded-xl bg-canvas" />
        </CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardBody className="pt-5">
        <h3 className="mb-1 text-[15px] font-medium text-fg">What you&rsquo;re looking for</h3>
        <p className="mb-4 text-[13px] text-fg-muted">
          Helps companies understand whether a role fits before reaching out.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="desiredJobTitle">Desired job title</Label>
            <Input
              id="desiredJobTitle"
              required
              minLength={2}
              value={desiredJobTitle}
              onChange={(e) => setDesiredJobTitle(e.target.value)}
              placeholder="Staff Engineer"
            />
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

          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="salaryMin">Min salary</Label>
              <Input
                id="salaryMin"
                type="number"
                min={0}
                value={expectedSalaryMin}
                onChange={(e) => setExpectedSalaryMin(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div>
              <Label htmlFor="salaryMax">Max salary</Label>
              <Input
                id="salaryMax"
                type="number"
                min={0}
                value={expectedSalaryMax}
                onChange={(e) => setExpectedSalaryMax(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                required
                minLength={3}
                maxLength={3}
                value={currency}
                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                placeholder="USD"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="noticePeriod">Notice period</Label>
            <Select
              id="noticePeriod"
              value={noticePeriod}
              onChange={(e) => setNoticePeriod(e.target.value as typeof noticePeriod)}
            >
              {NOTICE_PERIODS.map((period) => (
                <option key={period} value={period}>
                  {formatEnum(period)}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-wrap gap-5">
            <label className="flex items-center gap-2 text-[13.5px] text-fg-muted">
              <input
                type="checkbox"
                checked={openToRelocation}
                onChange={(e) => setOpenToRelocation(e.target.checked)}
                className="h-4 w-4 rounded border-line-strong accent-emerald-600"
              />
              Open to relocation
            </label>
            <label className="flex items-center gap-2 text-[13.5px] text-fg-muted">
              <input
                type="checkbox"
                checked={activelyLooking}
                onChange={(e) => setActivelyLooking(e.target.checked)}
                className="h-4 w-4 rounded border-line-strong accent-emerald-600"
              />
              Actively looking
            </label>
          </div>

          {error && <p className="text-[13px] text-rose-600 dark:text-rose-500">{error}</p>}

          <div className="flex items-center gap-3">
            <Button type="submit" size="sm" disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save'}
            </Button>
            {saved && <span className="text-[12.5px] text-fg-faint">Saved.</span>}
          </div>
        </form>
      </CardBody>
    </Card>
  );
}
