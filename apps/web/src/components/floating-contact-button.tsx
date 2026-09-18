'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { MessageCircleQuestion } from 'lucide-react';

import { cn } from '@/lib/cn';

export function FloatingContactButton() {
  const pathname = usePathname();

  // Don't show it on the contact page itself.
  if (pathname === '/contact') return null;

  // On /auth specifically, this button's fixed bottom-right slot overlaps
  // the submit button below ~640px wide (confirmed at 320-375px — the auth
  // card has no room to breathe on a short mobile viewport). Auth already
  // links to Contact from its own footer, so hiding this redundant bubble
  // below sm costs nothing; sm and up (including desktop) is unaffected.
  const isAuth = pathname === '/auth';

  return (
    // bottom-right (stacked above BackToTopButton's slot) rather than
    // bottom-left, which collides with Next.js's dev-mode indicator badge
    // and would intercept clicks in development.
    <Link
      href="/contact"
      aria-label="Contact us"
      className={cn(
        'fixed right-6 bottom-20 z-30 h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white shadow-[var(--shadow-lifted)] transition-transform hover:scale-105 dark:bg-emerald-500 dark:text-ink-950 print:hidden',
        isAuth ? 'hidden sm:flex' : 'flex',
      )}
    >
      <MessageCircleQuestion className="h-5 w-5" />
    </Link>
  );
}
