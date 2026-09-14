import { Briefcase } from 'lucide-react';

import { formatEnum } from '@/lib/enums';
import type { EmploymentExpectation } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardBody } from '@/components/ui/card';

export function LookingForCard({ expectation }: { expectation: EmploymentExpectation | null }) {
  if (!expectation) return null;

  const salary =
    expectation.expectedSalaryMin || expectation.expectedSalaryMax
      ? [expectation.expectedSalaryMin, expectation.expectedSalaryMax]
          .filter((v): v is number => v !== null)
          .map((v) => v.toLocaleString())
          .join(' – ') + ` ${expectation.currency}`
      : null;

  return (
    <Card className="mt-6">
      <CardBody className="pt-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-1.5 text-[13px] font-medium uppercase tracking-[0.04em] text-fg-faint">
            <Briefcase className="h-3.5 w-3.5" /> Looking for
          </h2>
          {expectation.activelyLooking && <Badge tone="emerald">Actively looking</Badge>}
        </div>

        <p className="mt-3 text-[15px] font-medium text-fg">{expectation.desiredJobTitle}</p>

        <div className="mt-2 flex flex-wrap gap-2">
          <Badge>{formatEnum(expectation.employmentType)}</Badge>
          <Badge>{formatEnum(expectation.workMode)}</Badge>
          <Badge>{formatEnum(expectation.noticePeriod)} notice</Badge>
          {expectation.openToRelocation && <Badge>Open to relocation</Badge>}
        </div>

        {salary && <p className="mt-3 text-[13.5px] text-fg-muted">Expecting {salary}</p>}
      </CardBody>
    </Card>
  );
}
