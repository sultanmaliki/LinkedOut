import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import type { ReactNode } from 'react';

import { BackToTopButton } from '@/components/back-to-top-button';
import { FloatingContactButton } from '@/components/floating-contact-button';
import { Footer } from '@/components/footer';
import { Header } from '@/components/header';
import { ScrollProgressBar } from '@/components/scroll-progress-bar';
import { VerifyEmailBanner } from '@/components/verify-email-banner';
import { AuthProvider } from '@/lib/auth-context';

import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  // Resolves relative OG/Twitter image URLs against the deployed site
  // instead of defaulting to localhost:3000 in production.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'LinkedOut — Companies apply. You decide.',
  description:
    'LinkedOut is the reverse-hiring platform where companies earn the attention of professionals through transparency, verified reviews, and respect.',
  manifest: '/manifest.webmanifest',
};

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'LinkedOut',
  url: siteUrl,
  description:
    'The reverse-hiring platform where companies earn the attention of professionals through transparency, verified reviews, and respect.',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: `${siteUrl}/search?q={search_term_string}` },
    'query-input': 'required name=search_term_string',
  },
};

// Runs before paint so the page never flashes the wrong theme: reads the
// saved preference (falling back to the OS setting) and sets the `dark`
// class synchronously, ahead of React hydration.
const noFlashThemeScript = `(function () {
  try {
    var stored = localStorage.getItem('linkedout.theme');
    var dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
  } catch (e) {}
})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning is scoped to this element only, and is the
    // standard escape hatch for a no-flash theme script: it deliberately
    // mutates this element's class before hydration runs, so a mismatch
    // here is expected, not a bug.
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlashThemeScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-ink-900 focus:px-4 focus:py-2 focus:text-[13.5px] focus:font-medium focus:text-white focus:dark:bg-emerald-500 focus:dark:text-ink-950"
        >
          Skip to content
        </a>
        <AuthProvider>
          <Header />
          <VerifyEmailBanner />
          <ScrollProgressBar />
          <div id="main-content" className="flex-1">
            {children}
          </div>
          <Footer />
          <BackToTopButton />
          <FloatingContactButton />
        </AuthProvider>
      </body>
    </html>
  );
}
