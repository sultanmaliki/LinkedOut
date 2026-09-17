import type { Metadata } from 'next';

import { ProfessionalsList } from './professionals-list';

export const metadata: Metadata = {
  title: 'Professionals — LinkedOut',
  description:
    'Browse verified professionals on LinkedOut by headline, location, or skill. Find who is actively looking.',
};

export default function ProfessionalsPage() {
  return <ProfessionalsList />;
}
