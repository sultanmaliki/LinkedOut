'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import { useAuth } from '@/lib/auth-context';
import { ProfileNav } from '@/components/profile-nav';
import { EmploymentExpectationSection } from './employment-expectation-section';
import { PortfolioLinksSection } from './portfolio-links-section';
import { SkillsSection } from './skills-section';

export default function SkillsAndCareerPage() {
  const router = useRouter();
  const { accessToken, isLoading: isAuthLoading } = useAuth();

  useEffect(() => {
    if (isAuthLoading) return;
    if (!accessToken) router.replace('/auth');
  }, [accessToken, isAuthLoading, router]);

  if (isAuthLoading || !accessToken) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-14">
        <ProfileNav />
        <div className="h-40 animate-pulse rounded-2xl bg-surface" />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <ProfileNav />

      <h1 className="mb-6 font-display text-[22px] font-medium tracking-[-0.01em] text-fg">
        Skills &amp; career
      </h1>

      <div className="space-y-6">
        <SkillsSection token={accessToken} />
        <PortfolioLinksSection token={accessToken} />
        <EmploymentExpectationSection token={accessToken} />
      </div>
    </main>
  );
}
