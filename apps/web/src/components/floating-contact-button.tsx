'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { MessageCircleQuestion } from 'lucide-react';

export function FloatingContactButton() {
  const pathname = usePathname();

  // Don't show it on the contact page itself.
  if (pathname === '/contact') return null;

  return (
    // bottom-right (stacked above BackToTopButton's slot) rather than
    // bottom-left, which collides with Next.js's dev-mode indicator badge
    // and would intercept clicks in development.
    <Link
      href="/contact"
      aria-label="Contact us"
      className="fixed right-6 bottom-20 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-ink-900 text-white shadow-[var(--shadow-lifted)] transition-transform hover:scale-105 dark:bg-emerald-500 dark:text-ink-950 print:hidden"
    >
      <MessageCircleQuestion className="h-5 w-5" />
    </Link>
  );
}
