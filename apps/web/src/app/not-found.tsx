import Link from 'next/link';
import { Compass } from 'lucide-react';

import { buttonStyles } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col items-center justify-center px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface">
        <Compass className="h-6 w-6 text-fg-faint" strokeWidth={1.5} />
      </div>

      <h1 className="mt-6 font-display text-[28px] font-medium tracking-[-0.01em] text-fg">
        Page not found
      </h1>
      <p className="mt-2 text-[14.5px] text-fg-muted">
        The page you&rsquo;re looking for doesn&rsquo;t exist, or may have moved.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
        <Link href="/" className={buttonStyles('primary', 'md')}>
          Back to home
        </Link>
        <Link href="/search" className={buttonStyles('secondary', 'md')}>
          Search LinkedOut
        </Link>
      </div>
    </main>
  );
}
