'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

export function BackToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 480);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className="fixed right-6 bottom-6 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-line-strong bg-surface text-fg-muted shadow-[var(--shadow-lifted)] transition-colors hover:text-fg print:hidden"
    >
      <ArrowUp className="h-4 w-4" />
    </button>
  );
}
