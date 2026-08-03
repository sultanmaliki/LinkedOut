import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'LinkedOut',
  description: 'LinkedOut authentication experience',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'sans-serif', background: '#f8fafc' }}>{children}</body>
    </html>
  );
}
