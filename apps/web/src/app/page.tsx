'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowRight, ArrowUpRight } from 'lucide-react';

import { buttonStyles } from '@/components/ui/button';

gsap.registerPlugin(ScrollTrigger);

const marqueeWords = [
  'Verified profiles',
  'No cover letters',
  'Transparent reviews',
  'Privacy by default',
  'No ATS games',
];

const principles = [
  {
    title: 'Verified over assumed',
    body: 'Employment history, company identity, and reviews are verified wherever possible — trust earned through evidence, not marketing copy.',
    seed: 'linkedout-verify',
  },
  {
    title: 'Reviews companies can’t hide',
    body: 'Employers can reply to reviews, but they can never delete or bury them. Transparency doesn’t require anyone’s approval.',
    seed: 'linkedout-review',
  },
  {
    title: 'Privacy by design',
    body: 'Your contact information stays private until you accept an opportunity — never before.',
    seed: 'linkedout-privacy',
  },
  {
    title: 'Companies held accountable',
    body: 'Public trust scores and verified reviews mean employers earn attention through the quality of their workplace.',
    seed: 'linkedout-accountable',
  },
];

const steps = [
  {
    index: '01',
    title: 'Build a verified profile',
    body: 'Showcase real skills, employment history, and portfolio work — verified, not just claimed.',
  },
  {
    index: '02',
    title: 'Companies come to you',
    body: 'Employers discover you through transparent search and send opportunities directly. No cover letters.',
  },
  {
    index: '03',
    title: 'You decide, on your terms',
    body: 'Review the opportunity, and your contact details are shared only after you explicitly accept.',
  },
];

const faqs = [
  {
    question: 'How is this different from a normal job board?',
    answer:
      'You never apply to postings. Companies discover your verified profile and send you opportunities directly. There’s no cover letter, no ATS, and no applying into the void.',
  },
  {
    question: 'Do I have to accept every opportunity I get?',
    answer:
      'No. You review each opportunity and decide whether to proceed. Nothing happens automatically, and there’s no penalty for declining.',
  },
  {
    question: 'When do companies get my contact details?',
    answer:
      'Only after you explicitly accept an opportunity. Before that, a company can see your public profile but has no way to reach you directly.',
  },
  {
    question: 'How are company reviews verified?',
    answer:
      'A review requires a verified employment history at that specific company — verified by confirming access to a company email address. Reviews can’t be posted against a company you didn’t actually work at.',
  },
  {
    question: 'Can a company delete or hide a bad review?',
    answer:
      'No. Companies can post one reply to a review, but they can never delete, hide, or edit it. Transparency doesn’t require anyone’s approval.',
  },
  {
    question: 'Is LinkedOut free for professionals?',
    answer:
      'Yes — building a profile, browsing companies, and receiving opportunities is free for professionals.',
  },
];

const missionWords =
  'Hiring should be based on mutual value, not one-sided approval. Professionals shouldn’t have to beg for opportunities.'.split(
    ' ',
  );

export default function HomePage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const missionRef = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      // Card stacking (Desire): each step card sticks in place while the next
      // one slides over it, scaling and dimming the one beneath for depth.
      const cards = gsap.utils.toArray<HTMLElement>('.stack-card');

      cards.forEach((card, i) => {
        if (i === cards.length - 1) return;

        gsap.to(card, {
          scale: 0.94,
          opacity: 0.5,
          ease: 'none',
          scrollTrigger: {
            trigger: cards[i + 1],
            start: 'top bottom',
            end: 'top center',
            scrub: true,
          },
        });
      });

      // Scrubbing text reveal (Desire): the mission statement lights up
      // word-by-word as it's scrolled through.
      if (missionRef.current) {
        gsap.fromTo(
          missionRef.current.querySelectorAll('span'),
          { opacity: 0.14 },
          {
            opacity: 1,
            stagger: 0.06,
            ease: 'none',
            scrollTrigger: {
              trigger: missionRef.current,
              start: 'top 85%',
              end: 'bottom 55%',
              scrub: true,
            },
          },
        );
      }
    },
    { scope: rootRef },
  );

  return (
    <main ref={rootRef} className="w-full max-w-full overflow-x-hidden">
      {/* ---------- Hero: Artistic Asymmetry ---------- */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 -z-10 opacity-70 dark:opacity-40"
          style={{
            background:
              'radial-gradient(55% 45% at 15% 15%, var(--color-emerald-100), transparent 60%), radial-gradient(40% 35% at 85% 75%, var(--color-emerald-50), transparent 65%)',
          }}
          aria-hidden
        />

        <div className="mx-auto max-w-6xl px-6 pt-24 pb-32 sm:pt-32">
          <h1
            className="max-w-4xl font-semibold tracking-[-0.03em] text-fg"
            style={{ fontSize: 'clamp(2.75rem, 5.4vw, 5.5rem)', lineHeight: 1.04 }}
          >
            Companies apply. <span className="text-emerald-600 dark:text-emerald-400">You</span>{' '}
            decide.
          </h1>

          <p className="mt-7 max-w-lg text-[17px] leading-relaxed text-fg-muted">
            LinkedOut reverses the hiring process. Build a verified profile, let companies earn your
            attention, and accept opportunities only on your terms.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href="/auth?mode=register" className={buttonStyles('primary', 'lg')}>
              Build your profile
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/companies" className={buttonStyles('outline', 'lg')}>
              Browse companies
            </Link>
          </div>

          <div className="group relative mt-16 ml-auto h-72 w-full max-w-xl overflow-hidden rounded-lg sm:h-80 lg:-mt-16 lg:ml-[38%]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://picsum.photos/seed/linkedout-hero/1400/900"
              alt="A professional reviewing verified employment history on a laptop"
              // This is the page's LCP element — without fetchPriority, the
              // browser treats it as a normal-priority image and queues it
              // behind other requests, which measured as a ~7s LCP in
              // Lighthouse even though the image itself loads in <1s once
              // requested.
              fetchPriority="high"
              width={1400}
              height={900}
              className="h-full w-full scale-105 object-cover contrast-125 grayscale transition-transform duration-700 ease-out group-hover:scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 via-ink-950/0 to-transparent" />
            <div className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-md bg-white/95 px-3 py-1.5 text-[12.5px] font-semibold text-ink-900 dark:bg-ink-900/95 dark:text-white">
              Verified, not just claimed
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Infinite marquee ---------- */}
      <section className="overflow-hidden border-y border-line bg-ink-900 py-5 dark:bg-ink-900">
        <div className="flex w-max animate-marquee">
          {[...marqueeWords, ...marqueeWords].map((word, i) => (
            <span
              key={`${word}-${i}`}
              className="mx-6 flex items-center gap-6 text-[22px] font-semibold tracking-[-0.01em] text-ink-100 whitespace-nowrap"
            >
              {word}
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
          ))}
        </div>
      </section>

      {/* ---------- Interest: horizontal accordion ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 max-w-lg">
          <h2
            className="font-semibold tracking-[-0.02em] text-fg"
            style={{ fontSize: 'clamp(1.9rem, 3vw, 2.6rem)' }}
          >
            Built on evidence, not marketing
          </h2>
        </div>

        <div className="flex h-[420px] gap-2 overflow-hidden rounded-lg sm:h-[460px]">
          {principles.map((pillar) => (
            <div
              key={pillar.title}
              className="group relative flex-1 cursor-pointer overflow-hidden rounded-lg transition-[flex-grow] duration-500 ease-out hover:flex-[3]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://picsum.photos/seed/${pillar.seed}/900/1400`}
                alt=""
                className="absolute inset-0 h-full w-full scale-110 object-cover mix-blend-luminosity transition-transform duration-700 ease-out group-hover:scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/40 to-ink-950/10" />

              <div className="absolute inset-0 flex flex-col justify-end p-5">
                <h3 className="text-[18px] leading-tight font-semibold tracking-[-0.01em] text-white [writing-mode:vertical-rl] group-hover:[writing-mode:horizontal-tb]">
                  {pillar.title}
                </h3>
                <p className="mt-2 max-w-xs text-[13.5px] leading-relaxed text-ink-200 opacity-0 transition-opacity delay-100 duration-300 group-hover:opacity-100">
                  {pillar.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Desire: stacking steps ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-24" ref={stackRef}>
        <div className="mb-16 max-w-lg">
          <h2
            className="font-semibold tracking-[-0.02em] text-fg"
            style={{ fontSize: 'clamp(1.9rem, 3vw, 2.6rem)' }}
          >
            How it works
          </h2>
          <p className="mt-3 text-[15px] text-fg-muted">
            Three steps. No applications, no ATS games, no begging for a callback.
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {steps.map((step) => (
            <div
              key={step.index}
              className="stack-card sticky top-24 flex flex-col gap-4 rounded-lg border border-line bg-surface p-8 sm:flex-row sm:items-center sm:gap-10 sm:p-10"
            >
              <span className="text-[15px] font-semibold text-emerald-600 dark:text-emerald-400">
                {step.index}
              </span>
              <div>
                <h3 className="text-[20px] font-semibold tracking-[-0.01em] text-fg">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-md text-[14.5px] leading-relaxed text-fg-muted">
                  {step.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Scrubbing mission statement ---------- */}
      <section className="bg-ink-950 py-28 text-ink-50">
        <div className="mx-auto max-w-4xl px-6">
          <p
            ref={missionRef}
            className="font-semibold tracking-[-0.02em]"
            style={{ fontSize: 'clamp(1.75rem, 3.4vw, 2.75rem)', lineHeight: 1.3 }}
          >
            {missionWords.map((word, i) => (
              <span key={`${word}-${i}`}>
                {word}
                {i < missionWords.length - 1 ? ' ' : ''}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-14">
          <h2
            className="font-semibold tracking-[-0.02em] text-fg"
            style={{ fontSize: 'clamp(1.9rem, 3vw, 2.6rem)' }}
          >
            Frequently asked
          </h2>
        </div>

        <div className="divide-y divide-line border-t border-line-strong">
          {faqs.map((faq, index) => (
            <div
              key={faq.question}
              className="grid gap-2 py-7 sm:grid-cols-[2rem_1fr_1.2fr] sm:gap-8"
            >
              <span className="text-[14px] font-semibold text-fg-faint">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="text-[16px] font-semibold tracking-[-0.01em] text-fg">
                {faq.question}
              </h3>
              <p className="max-w-xl text-[14.5px] leading-relaxed text-fg-muted">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- Action: high-contrast CTA ---------- */}
      <section className="bg-emerald-600 dark:bg-emerald-500">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-6 py-20 sm:flex-row sm:items-end">
          <h2
            className="max-w-lg font-semibold tracking-[-0.02em] text-white"
            style={{ fontSize: 'clamp(1.9rem, 3.4vw, 3rem)', lineHeight: 1.1 }}
          >
            Get started — it&rsquo;s free.
          </h2>
          <Link
            href="/auth?mode=register"
            className="group inline-flex h-14 shrink-0 items-center justify-center gap-2 rounded-md bg-white px-7 text-[15.5px] font-semibold tracking-[-0.01em] text-emerald-700 transition-all duration-150 ease-out hover:bg-emerald-50 active:scale-[0.98]"
          >
            Build your profile
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
