import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

type Tone = 'neutral' | 'emerald' | 'gold' | 'rose';

const toneStyles: Record<Tone, string> = {
  neutral: 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300',
  emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-600/20 dark:text-emerald-400',
  gold: 'bg-gold-100 text-gold-600 dark:bg-gold-600/20 dark:text-gold-400',
  rose: 'bg-rose-100 text-rose-600 dark:bg-rose-600/20 dark:text-rose-500',
};

export function Badge({
  tone = 'neutral',
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-[3px] px-2 py-0.5 text-[11px] font-semibold tracking-[0.02em] uppercase',
        toneStyles[tone],
        className,
      )}
      {...props}
    />
  );
}
