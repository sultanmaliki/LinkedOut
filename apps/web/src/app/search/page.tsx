import type { Metadata } from 'next';

import { SearchPageContent } from './search-results';

export const metadata: Metadata = {
  title: 'Search — LinkedOut',
  description: 'Search LinkedOut for professionals by name or headline, and companies by name.',
  robots: { index: false, follow: true },
};

export default function SearchPage() {
  return <SearchPageContent />;
}
