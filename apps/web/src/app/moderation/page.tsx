'use client';

import { useState } from 'react';
import { ShieldAlert } from 'lucide-react';

import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/cn';
import { Card, CardBody } from '@/components/ui/card';
import { AdminPanel } from './admin-panel';
import { AuditLogPanel } from './audit-log-panel';
import { CasesPanel } from './cases-panel';
import { TrustFlagsPanel } from './trust-flags-panel';

const baseTabs = ['Cases', 'Trust flags', 'Audit log'] as const;
type Tab = (typeof baseTabs)[number] | 'Admin';

export default function ModerationPage() {
  const { user, accessToken, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('Cases');

  if (isLoading) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-14">
        <div className="h-40 animate-pulse rounded-2xl bg-surface" />
      </main>
    );
  }

  const isAdmin = user?.role === 'ADMIN';
  const canModerate = user?.role === 'MODERATOR' || isAdmin;
  const tabs: Tab[] = isAdmin ? [...baseTabs, 'Admin'] : [...baseTabs];

  if (!canModerate || !accessToken) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-14">
        <Card>
          <CardBody className="flex flex-col items-center gap-3 pt-12 pb-12 text-center">
            <ShieldAlert className="h-7 w-7 text-fg-faint" strokeWidth={1.5} />
            <p className="text-[14.5px] text-fg-muted">Moderator access required.</p>
          </CardBody>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-14">
      <h1 className="mb-6 font-display text-[26px] font-medium tracking-[-0.01em] text-fg">
        Moderation
      </h1>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-line">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'relative shrink-0 px-3.5 py-2.5 text-[14px] font-medium transition-colors',
              activeTab === tab ? 'text-fg' : 'text-fg-muted hover:text-fg',
            )}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-emerald-500" />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'Cases' && <CasesPanel token={accessToken} />}
      {activeTab === 'Trust flags' && <TrustFlagsPanel token={accessToken} />}
      {activeTab === 'Audit log' && <AuditLogPanel token={accessToken} />}
      {activeTab === 'Admin' && isAdmin && <AdminPanel token={accessToken} />}
    </main>
  );
}
