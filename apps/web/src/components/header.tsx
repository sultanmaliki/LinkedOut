'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/cn';
import { Button, buttonStyles } from '@/components/ui/button';

const navItems = [
  { href: '/feed', label: 'Feed' },
  { href: '/companies', label: 'Companies' },
  { href: '/opportunities', label: 'Opportunities' },
  { href: '/companies/mine', label: 'For companies' },
];

export function Header() {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-900 text-[13px] font-semibold text-white dark:bg-emerald-500 dark:text-ink-950">
            L
          </span>
          <span className="font-display text-[19px] font-medium tracking-[-0.01em] text-fg">
            LinkedOut
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const activeHref = navItems
              .map((candidate) => candidate.href)
              .filter((href) => pathname?.startsWith(href))
              .sort((a, b) => b.length - a.length)[0];

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-lg px-3 py-2 text-[14px] font-medium transition-colors',
                  item.href === activeHref ? 'text-fg' : 'text-fg-muted hover:text-fg',
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {!isLoading && user ? (
            <>
              <Link
                href="/me"
                className="text-[14px] font-medium text-fg-muted transition-colors hover:text-fg"
              >
                {user.name}
              </Link>
              <Button variant="ghost" size="sm" onClick={logout}>
                Sign out
              </Button>
            </>
          ) : (
            !isLoading && (
              <>
                <Link href="/auth" className="text-[14px] font-medium text-fg-muted hover:text-fg">
                  Sign in
                </Link>
                <Link href="/auth?mode=register" className={buttonStyles('primary', 'sm')}>
                  Join free
                </Link>
              </>
            )
          )}
        </div>
      </div>
    </header>
  );
}
