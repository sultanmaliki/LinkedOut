'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

import { ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { ProfileNav } from '@/components/profile-nav';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Input, Label } from '@/components/ui/input';

export default function SecurityPage() {
  const router = useRouter();
  const { accessToken, isLoading: isAuthLoading, changePassword } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthLoading) return;
    if (!accessToken) router.replace('/auth');
  }, [accessToken, isAuthLoading, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to change your password.');
    } finally {
      setIsSubmitting(false);
    }
  }

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

      <Card className="max-w-md">
        <CardBody className="pt-6">
          <h1 className="mb-1 font-display text-[20px] font-medium tracking-[-0.01em] text-fg">
            Change password
          </h1>
          <p className="mb-6 text-[13.5px] text-fg-muted">
            You&rsquo;ll stay signed in here; other devices will need the new password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="currentPassword">Current password</Label>
              <Input
                id="currentPassword"
                type={showPasswords ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="newPassword">New password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPasswords ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords((show) => !show)}
                  aria-label={showPasswords ? 'Hide passwords' : 'Show passwords'}
                  className="absolute top-1/2 right-2.5 -translate-y-1/2 text-fg-faint transition-colors hover:text-fg-muted"
                >
                  {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <Input
                id="confirmPassword"
                type={showPasswords ? 'text' : 'password'}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-rose-100 px-3.5 py-3 text-[13.5px] text-rose-600 dark:bg-rose-600/10 dark:text-rose-500">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 rounded-xl bg-emerald-100 px-3.5 py-3 text-[13.5px] text-emerald-700 dark:bg-emerald-600/10 dark:text-emerald-400">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                <span>Password changed.</span>
              </div>
            )}

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Change password'}
            </Button>
          </form>
        </CardBody>
      </Card>
    </main>
  );
}
