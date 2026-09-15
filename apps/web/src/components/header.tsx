'use client';

import { useEffect, useState, type FormEvent, type KeyboardEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, Search, X } from 'lucide-react';

import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/cn';
import { Button, buttonStyles } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';

const navItems = [
  { href: '/feed', label: 'Feed' },
  { href: '/professionals', label: 'Professionals' },
  { href: '/companies', label: 'Companies' },
  { href: '/opportunities', label: 'Opportunities' },
  { href: '/companies/mine', label: 'For companies' },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const canModerate = user?.role === 'MODERATOR' || user?.role === 'ADMIN';
  const items = canModerate
    ? [...navItems, { href: '/moderation', label: 'Moderation' }]
    : navItems;

  // Close the mobile menu on route changes so it doesn't stay open after a nav click.
  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  function activeHrefFor(list: typeof items) {
    return list
      .map((candidate) => candidate.href)
      .filter((href) => pathname?.startsWith(href))
      .sort((a, b) => b.length - a.length)[0];
  }

  function submitSearch() {
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    setSearchOpen(false);
  }

  function handleSearchSubmit(event: FormEvent) {
    event.preventDefault();
    submitSearch();
  }

  // Belt-and-suspenders alongside the form's onSubmit: a form with a single
  // text field and no submit button relies on the browser's implicit-submit
  // behavior on Enter, which isn't consistently triggered in every
  // environment (including some automated/testing ones) — handling it here
  // directly makes Enter reliable regardless.
  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter') {
      event.preventDefault();
      submitSearch();
    }
  }

  const activeHref = activeHrefFor(items);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-ink-900 text-[13px] font-semibold text-white dark:bg-emerald-500 dark:text-ink-950">
            L
          </span>
          <span className="font-display text-[19px] font-medium tracking-[-0.01em] text-fg">
            LinkedOut
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {items.map((item) => (
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
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
              aria-label="Search"
              aria-expanded={searchOpen}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-surface hover:text-fg"
            >
              <Search className="h-4 w-4" />
            </button>

            {searchOpen && (
              // Absolutely positioned so an open search box never affects the
              // header's own layout width (that previously caused horizontal
              // overflow at narrower desktop widths).
              <form
                onSubmit={handleSearchSubmit}
                className="absolute top-full right-0 mt-2 flex w-64 items-center gap-1 rounded-xl border border-line-strong bg-surface p-1.5 shadow-[var(--shadow-lifted)]"
              >
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  onBlur={() => !query && setSearchOpen(false)}
                  placeholder="Search professionals, companies…"
                  className="h-9 w-full rounded-lg border border-line-strong bg-canvas px-3 text-[13.5px] text-fg placeholder:text-fg-faint outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  aria-label="Submit search"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-canvas hover:text-fg"
                >
                  <Search className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>

          <ThemeToggle />

          <div className="hidden items-center gap-3 sm:flex">
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
                  <Link
                    href="/auth"
                    className="text-[14px] font-medium text-fg-muted hover:text-fg"
                  >
                    Sign in
                  </Link>
                  <Link href="/auth?mode=register" className={buttonStyles('primary', 'sm')}>
                    Join free
                  </Link>
                </>
              )
            )}
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-surface hover:text-fg md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-line bg-canvas md:hidden">
          <form onSubmit={handleSearchSubmit} className="px-6 pt-4">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search professionals, companies…"
              className="h-9 w-full rounded-lg border border-line-strong bg-canvas px-3 text-[14px] text-fg placeholder:text-fg-faint outline-none focus:border-emerald-500"
            />
          </form>

          <nav className="flex flex-col gap-0.5 px-4 py-4">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-lg px-3 py-2.5 text-[15px] font-medium transition-colors',
                  item.href === activeHref ? 'bg-surface text-fg' : 'text-fg-muted hover:text-fg',
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex flex-col gap-2 border-t border-line px-6 py-4">
            {!isLoading && user ? (
              <>
                <Link href="/me" className="text-[14.5px] font-medium text-fg-muted hover:text-fg">
                  {user.name}
                </Link>
                <Button variant="secondary" size="sm" onClick={logout} className="w-fit">
                  Sign out
                </Button>
              </>
            ) : (
              !isLoading && (
                <>
                  <Link href="/auth" className="text-[14.5px] font-medium text-fg-muted hover:text-fg">
                    Sign in
                  </Link>
                  <Link
                    href="/auth?mode=register"
                    className={buttonStyles('primary', 'sm', 'w-fit')}
                  >
                    Join free
                  </Link>
                </>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
}
