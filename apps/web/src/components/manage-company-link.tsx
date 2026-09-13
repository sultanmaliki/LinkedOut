'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Settings } from 'lucide-react';

import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Company } from '@/lib/types';
import { buttonStyles } from '@/components/ui/button';

export function ManageCompanyLink({ companyId }: { companyId: string }) {
  const { accessToken, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isLoading || !accessToken) return;

    apiFetch<Company[]>('/companies/mine', { token: accessToken })
      .then((companies) => setIsAdmin(companies.some((c) => c.id === companyId)))
      .catch(() => setIsAdmin(false));
  }, [accessToken, isLoading, companyId]);

  if (!isAdmin) return null;

  return (
    <Link href={`/companies/${companyId}/manage`} className={buttonStyles('secondary', 'sm')}>
      <Settings className="h-3.5 w-3.5" /> Manage
    </Link>
  );
}
