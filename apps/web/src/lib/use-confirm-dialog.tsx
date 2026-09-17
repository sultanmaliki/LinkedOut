'use client';

import { useState } from 'react';

import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface ConfirmRequest {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
}

/**
 * Renders and drives a single confirmation dialog for a component. Usage:
 *   const { requestConfirm, dialog } = useConfirmDialog();
 *   <button onClick={() => requestConfirm({ title, description, onConfirm: doDelete })}>Delete</button>
 *   {dialog}
 */
export function useConfirmDialog() {
  const [pending, setPending] = useState<ConfirmRequest | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  async function handleConfirm() {
    if (!pending) return;
    setIsBusy(true);
    try {
      await pending.onConfirm();
      setPending(null);
    } finally {
      setIsBusy(false);
    }
  }

  const dialog = (
    <ConfirmDialog
      open={pending !== null}
      title={pending?.title ?? ''}
      description={pending?.description ?? ''}
      confirmLabel={pending?.confirmLabel}
      isBusy={isBusy}
      onConfirm={handleConfirm}
      onCancel={() => setPending(null)}
    />
  );

  return { requestConfirm: setPending, dialog };
}
