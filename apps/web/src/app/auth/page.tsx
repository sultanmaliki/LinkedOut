import type { Metadata } from 'next';

import { AuthPageContent } from './auth-form';

export const metadata: Metadata = {
  title: 'Sign in — LinkedOut',
  description:
    'Sign in or create a LinkedOut account to build your profile and review opportunities.',
};

export default function AuthPage() {
  return <AuthPageContent />;
}
