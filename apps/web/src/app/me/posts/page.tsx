'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Archive, ArchiveRestore, Newspaper, Trash2 } from 'lucide-react';

import { ApiError, apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Post } from '@/lib/types';
import { ProfileNav } from '@/components/profile-nav';
import { Badge } from '@/components/ui/badge';
import { Card, CardBody } from '@/components/ui/card';
import { AttachmentManager } from './attachment-manager';

function statusBadge(visibility: Post['visibility']) {
  if (visibility === 'ARCHIVED') return <Badge>Archived</Badge>;
  if (visibility === 'SCHEDULED') return <Badge tone="gold">Scheduled</Badge>;
  return <Badge tone="emerald">Visible</Badge>;
}

export default function MyPostsPage() {
  const router = useRouter();
  const { accessToken, isLoading: isAuthLoading } = useAuth();

  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!accessToken) return;
    apiFetch<Post[]>('/professionals/me/posts', { token: accessToken })
      .then((list) => setPosts([...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load posts'));
  }, [accessToken]);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!accessToken) {
      router.replace('/auth');
      return;
    }

    load();
  }, [accessToken, isAuthLoading, router, load]);

  async function archive(postId: string) {
    if (!accessToken) return;
    await apiFetch(`/posts/${postId}/archive`, { method: 'POST', token: accessToken });
    load();
  }

  async function restore(postId: string) {
    if (!accessToken) return;
    await apiFetch(`/posts/${postId}/restore`, { method: 'POST', token: accessToken });
    load();
  }

  async function remove(postId: string) {
    if (!accessToken) return;
    await apiFetch(`/posts/${postId}`, { method: 'DELETE', token: accessToken });
    setConfirmingDeleteId(null);
    load();
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-14">
      <ProfileNav />

      <div className="mb-6">
        <h1 className="font-display text-[22px] font-medium tracking-[-0.01em] text-fg">
          My posts
        </h1>
        <p className="mt-1 text-[14px] text-fg-muted">
          Archive, restore, delete, or attach files to posts you&rsquo;ve shared.
        </p>
      </div>

      {error ? (
        <Card>
          <CardBody className="pt-6 text-[14.5px] text-fg-muted">{error}</CardBody>
        </Card>
      ) : posts === null ? (
        <div className="h-32 animate-pulse rounded-2xl bg-surface" />
      ) : posts.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 px-6 py-14 text-center">
          <Newspaper className="h-7 w-7 text-fg-faint" strokeWidth={1.5} />
          <p className="text-[14.5px] text-fg-muted">No posts yet.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                {statusBadge(post.visibility)}
                <span className="text-[12px] text-fg-faint">
                  {new Date(post.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <p className="mt-3 whitespace-pre-line text-[14.5px] leading-relaxed text-fg">
                {post.content}
              </p>

              {accessToken && <AttachmentManager postId={post.id} token={accessToken} />}

              <div className="mt-3 flex items-center gap-4 border-t border-line pt-3">
                {post.visibility === 'ARCHIVED' ? (
                  <button
                    onClick={() => restore(post.id)}
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-fg-muted hover:text-fg"
                  >
                    <ArchiveRestore className="h-3.5 w-3.5" /> Restore
                  </button>
                ) : (
                  <button
                    onClick={() => archive(post.id)}
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-fg-muted hover:text-fg"
                  >
                    <Archive className="h-3.5 w-3.5" /> Archive
                  </button>
                )}

                {confirmingDeleteId === post.id ? (
                  <button
                    onClick={() => remove(post.id)}
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-rose-600 dark:text-rose-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Confirm delete?
                  </button>
                ) : (
                  <button
                    onClick={() => setConfirmingDeleteId(post.id)}
                    className="inline-flex items-center gap-1.5 text-[13px] font-medium text-fg-muted hover:text-rose-600 dark:hover:text-rose-500"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
