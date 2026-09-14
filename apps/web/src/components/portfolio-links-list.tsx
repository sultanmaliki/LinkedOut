import { ExternalLink } from 'lucide-react';

import type { PortfolioLink } from '@/lib/types';

export function PortfolioLinksList({ links }: { links: PortfolioLink[] }) {
  if (links.length === 0) return null;

  return (
    <div className="mt-6">
      <h2 className="text-[13px] font-medium uppercase tracking-[0.04em] text-fg-faint">
        Portfolio
      </h2>
      <div className="mt-3 flex flex-wrap gap-3">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[13.5px] font-medium text-fg hover:text-emerald-600"
          >
            <ExternalLink className="h-3.5 w-3.5" /> {link.title}
          </a>
        ))}
      </div>
    </div>
  );
}
