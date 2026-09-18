'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';

import { buttonStyles } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface">
        <AlertTriangle className="h-6 w-6 text-fg-faint" strokeWidth={1.5} />
      </div>

      <h1 className="mt-6 font-display text-[28px] font-medium tracking-[-0.01em] text-fg">
        Something went wrong
      </h1>
      <p className="mt-2 text-[14.5px] text-fg-muted">
        An unexpected error occurred. You can try again, or head back home.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <button type="button" onClick={reset} className={buttonStyles('primary', 'md')}>
          Try again
        </button>
        <Link href="/" className={buttonStyles('secondary', 'md')}>
          Back to home
        </Link>
      </div>
    </main>
  );
}
