import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-[13px] text-fg-faint sm:flex-row">
        <p>&copy; {new Date().getFullYear()} LinkedOut. Companies apply. You decide.</p>
        <div className="flex items-center gap-5">
          <Link href="/companies" className="hover:text-fg-muted">
            Companies
          </Link>
          <Link href="/opportunities" className="hover:text-fg-muted">
            Opportunities
          </Link>
        </div>
      </div>
    </footer>
  );
}
