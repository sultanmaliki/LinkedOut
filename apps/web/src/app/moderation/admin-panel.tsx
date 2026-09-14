'use client';

import { useState, type FormEvent } from 'react';

import { ApiError, apiFetch } from '@/lib/api';
import type { AdminUserRecord, UserRole } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const ROLES: UserRole[] = ['PROFESSIONAL', 'COMPANY_ADMIN', 'MODERATOR', 'ADMIN'];

export function AdminPanel({ token }: { token: string }) {
  const [email, setEmail] = useState('');
  const [user, setUser] = useState<AdminUserRecord | null>(null);
  const [role, setRole] = useState<UserRole>('PROFESSIONAL');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function handleLookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setUser(null);
    setIsLookingUp(true);

    try {
      const found = await apiFetch<AdminUserRecord>(
        `/users/lookup?email=${encodeURIComponent(email.trim())}`,
        { token },
      );
      setUser(found);
      setRole(found.role);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to look up user');
    } finally {
      setIsLookingUp(false);
    }
  }

  async function saveRole() {
    if (!user) return;
    setError(null);
    setSaved(false);
    setIsSaving(true);

    try {
      const updated = await apiFetch<AdminUserRecord>(`/users/${user.id}/role`, {
        method: 'PATCH',
        token,
        body: { role },
      });
      setUser(updated);
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to update role');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card>
      <CardBody className="pt-5">
        <h3 className="mb-4 text-[15px] font-medium text-fg">Manage a user&rsquo;s role</h3>

        <form onSubmit={handleLookup} className="flex gap-2">
          <div className="flex-1">
            <Label>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="user@example.com"
            />
          </div>
          <Button type="submit" variant="secondary" className="self-end" disabled={isLookingUp}>
            {isLookingUp ? 'Looking up…' : 'Look up'}
          </Button>
        </form>

        {error && <p className="mt-3 text-[13px] text-rose-600 dark:text-rose-500">{error}</p>}

        {user && (
          <div className="mt-5 space-y-3 rounded-xl border border-line-strong bg-canvas p-4">
            <p className="text-[13.5px] text-fg-muted">
              <span className="font-medium text-fg">{user.email}</span> · status {user.status}
            </p>

            <div className="flex items-center gap-2">
              <Select
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-auto"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r.replace(/_/g, ' ')}
                  </option>
                ))}
              </Select>
              <Button
                type="button"
                size="sm"
                onClick={saveRole}
                disabled={isSaving || role === user.role}
              >
                {isSaving ? 'Saving…' : 'Save role'}
              </Button>
              {saved && <span className="text-[12.5px] text-fg-faint">Saved.</span>}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
