import Link from 'next/link';
import { ArrowRight, Building2, ShieldCheck, Star, Users } from 'lucide-react';

import { buttonStyles } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const steps = [
  {
    title: 'Build a verified profile',
    body: 'Showcase real skills, employment history, and portfolio work — verified, not just claimed.',
  },
  {
    title: 'Companies come to you',
    body: 'Employers discover you through transparent search and send opportunities directly. No cover letters.',
  },
  {
    title: 'You decide, on your terms',
    body: 'Review the opportunity, and your contact details are shared only after you explicitly accept.',
  },
];

const pillars = [
  {
    icon: ShieldCheck,
    title: 'Verified over assumed',
    body: 'Employment history, company identity, and reviews are verified wherever possible — trust earned through evidence, not marketing copy.',
  },
  {
    icon: Star,
    title: 'Reviews companies can’t hide',
    body: 'Employers can reply to reviews, but they can never delete or bury them. Transparency doesn’t require anyone’s approval.',
  },
  {
    icon: Users,
    title: 'Privacy by design',
    body: 'Your contact information stays private until you accept an opportunity — never before.',
  },
  {
    icon: Building2,
    title: 'Companies held accountable',
    body: 'Public trust scores and verified reviews mean employers earn attention through the quality of their workplace.',
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(60%_60%_at_50%_0%,var(--color-emerald-100),transparent)] opacity-60 dark:bg-[radial-gradient(60%_60%_at_50%_0%,rgba(14,159,110,0.12),transparent)]"
          aria-hidden
        />
        <div className="mx-auto max-w-4xl px-6 pt-24 pb-20 text-center sm:pt-32">
          <span className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-3.5 py-1.5 text-[13px] font-medium text-fg-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Reverse hiring, done properly
          </span>

          <h1 className="mt-6 font-display text-[44px] leading-[1.08] font-medium tracking-[-0.02em] text-fg sm:text-[64px]">
            Companies apply.
            <br />
            <span className="text-emerald-600 dark:text-emerald-400">You decide.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-fg-muted">
            LinkedOut reverses the hiring process. Build a verified profile, let companies earn your
            attention through transparency and verified reviews, and accept opportunities only on
            your terms.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/auth?mode=register" className={buttonStyles('primary', 'lg')}>
              Build your profile
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/companies" className={buttonStyles('secondary', 'lg')}>
              Browse companies
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 max-w-lg">
          <h2 className="font-display text-[30px] font-medium tracking-[-0.01em] text-fg">
            How it works
          </h2>
          <p className="mt-2 text-[15px] text-fg-muted">
            Three steps. No applications, no ATS games, no begging for a callback.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="relative">
              <span className="font-display text-[15px] font-medium text-emerald-600 dark:text-emerald-400">
                0{index + 1}
              </span>
              <h3 className="mt-3 text-[17px] font-medium tracking-[-0.01em] text-fg">
                {step.title}
              </h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-fg-muted">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-surface/50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 max-w-lg">
            <h2 className="font-display text-[30px] font-medium tracking-[-0.01em] text-fg">
              Built on evidence, not marketing
            </h2>
            <p className="mt-2 text-[15px] text-fg-muted">
              The principles that shape every part of the platform.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {pillars.map((pillar) => (
              <Card key={pillar.title} className="p-6">
                <pillar.icon
                  className="h-5 w-5 text-emerald-600 dark:text-emerald-400"
                  strokeWidth={1.75}
                />
                <h3 className="mt-4 text-[16px] font-medium tracking-[-0.01em] text-fg">
                  {pillar.title}
                </h3>
                <p className="mt-1.5 text-[14.5px] leading-relaxed text-fg-muted">{pillar.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h2 className="font-display text-[32px] font-medium tracking-[-0.02em] text-fg">
          Hiring should be based on mutual value, not one-sided approval.
        </h2>
        <p className="mt-4 text-[15px] text-fg-muted">
          Professionals shouldn&rsquo;t have to beg for opportunities. Companies should earn
          attention through the quality of their workplace.
        </p>
        <div className="mt-8">
          <Link href="/auth?mode=register" className={buttonStyles('primary', 'lg')}>
            Get started — it&rsquo;s free
          </Link>
        </div>
      </section>
    </main>
  );
}
