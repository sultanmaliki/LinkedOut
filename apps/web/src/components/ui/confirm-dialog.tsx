'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  isDestructive?: boolean;
  isBusy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  isDestructive = true,
  isBusy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onCancel();
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-[var(--shadow-lifted)]">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-600/10">
          <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-500" strokeWidth={1.75} />
        </div>

        <h2 id="confirm-dialog-title" className="mt-4 text-[17px] font-medium text-fg">
          {title}
        </h2>
        <p className="mt-1.5 text-[14px] leading-relaxed text-fg-muted">{description}</p>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onCancel} disabled={isBusy}>
            Cancel
          </Button>
          <Button
            variant={isDestructive ? 'primary' : 'secondary'}
            size="sm"
            onClick={onConfirm}
            disabled={isBusy}
            className={
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500'
                : undefined
            }
          >
            {isBusy ? 'Please wait…' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
