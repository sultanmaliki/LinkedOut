'use client';

import { cn } from '@/lib/cn';

export function RatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((score) => (
        <button
          key={score}
          type="button"
          aria-label={`${score} out of 5`}
          onClick={() => onChange(score)}
          className={cn(
            'h-2 w-7 rounded-full transition-colors',
            score <= value
              ? 'bg-emerald-500'
              : 'bg-ink-200 hover:bg-ink-300 dark:bg-ink-700 dark:hover:bg-ink-600',
          )}
        />
      ))}
    </div>
  );
}
