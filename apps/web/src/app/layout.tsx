import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import type { ReactNode } from 'react';

import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { VerifyEmailBanner } from '@/components/verify-email-banner';
import { AuthProvider } from '@/lib/auth-context';

import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  axes: ['opsz'],
});

export const metadata: Metadata = {
  title: 'LinkedOut — Companies apply. You decide.',
  description:
    'LinkedOut is the reverse-hiring platform where companies earn the attention of professionals through transparency, verified reviews, and respect.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="flex min-h-screen flex-col">
        <AuthProvider>
          <Header />
          <VerifyEmailBanner />
          <div className="flex-1">{children}</div>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
