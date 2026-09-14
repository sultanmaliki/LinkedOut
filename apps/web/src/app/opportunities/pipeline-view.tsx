'use client';

import { useEffect, useState } from 'react';

import { apiFetch } from '@/lib/api';
import { formatEnum } from '@/lib/enums';
import type { HiringPipelineStage } from '@/lib/types';

export function PipelineView({ opportunityId, token }: { opportunityId: string; token: string }) {
  const [stages, setStages] = useState<HiringPipelineStage[] | null>(null);

  useEffect(() => {
    apiFetch<HiringPipelineStage[]>(`/opportunities/${opportunityId}/pipeline`, { token }).then(
      setStages,
    );
  }, [opportunityId, token]);

  if (!stages) {
    return <div className="h-10 animate-pulse rounded-xl bg-canvas" />;
  }

  return (
    <ol className="space-y-2">
      {stages.map((stage) => (
        <li key={stage.id} className="flex items-center gap-3 text-[13px]">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
          <span className="font-medium text-fg">{formatEnum(stage.stage)}</span>
          <span className="text-fg-faint">
            {new Date(stage.changedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
          {stage.notes && <span className="text-fg-muted">— {stage.notes}</span>}
        </li>
      ))}
    </ol>
  );
}
