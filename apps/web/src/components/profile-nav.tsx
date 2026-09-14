'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/cn';

const tabs = [
  { href: '/me', label: 'Profile' },
  { href: '/me/employment', label: 'Employment' },
  { href: '/me/skills', label: 'Skills & career' },
  { href: '/me/reviews/new', label: 'Write a review' },
];

export function ProfileNav() {
  const pathname = usePathname();

  return (
    <div className="mb-8 flex gap-1 border-b border-line">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'relative px-3.5 py-2.5 text-[14px] font-medium transition-colors',
              isActive ? 'text-fg' : 'text-fg-muted hover:text-fg',
            )}
          >
            {tab.label}
            {isActive && (
              <span className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-emerald-500" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
