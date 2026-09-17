import {
  describeStatus,
  isExitStage,
  PIPELINE_STAGES,
  PIPELINE_STAGE_LABELS,
} from '@/lib/pipeline';
import type { DisplayStatus } from '@/lib/types';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/ui/badge';

export function PipelineStepper({
  displayStatus,
  perspective,
}: {
  displayStatus: DisplayStatus;
  perspective: 'professional' | 'company';
}) {
  const { label, tone } = describeStatus(displayStatus, perspective);

  if (isExitStage(displayStatus.stage)) {
    return (
      <div className="flex items-center gap-2.5">
        <span className="h-1.5 flex-1 rounded-full bg-line-strong" />
        <Badge tone={tone}>{label}</Badge>
      </div>
    );
  }

  const currentIndex = PIPELINE_STAGES.indexOf(
    displayStatus.stage as (typeof PIPELINE_STAGES)[number],
  );

  return (
    <div>
      <div
        className="flex items-center gap-1"
        role="img"
        aria-label={`Pipeline stage: ${PIPELINE_STAGE_LABELS[displayStatus.stage as (typeof PIPELINE_STAGES)[number]] ?? displayStatus.stage}`}
      >
        {PIPELINE_STAGES.map((stage, i) => (
          <span
            key={stage}
            title={PIPELINE_STAGE_LABELS[stage]}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              i < currentIndex && 'bg-emerald-500',
              i === currentIndex &&
                (tone === 'rose'
                  ? 'bg-rose-500'
                  : tone === 'gold'
                    ? 'bg-gold-500'
                    : 'bg-emerald-500'),
              i > currentIndex && 'bg-line-strong',
            )}
          />
        ))}
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-fg">
          {PIPELINE_STAGE_LABELS[displayStatus.stage as (typeof PIPELINE_STAGES)[number]] ??
            displayStatus.stage}
        </span>
        <Badge tone={tone}>{label}</Badge>
      </div>
    </div>
  );
}
