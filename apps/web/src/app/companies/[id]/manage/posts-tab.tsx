'use client';

import { useCallback, useEffect, useState } from 'react';
import { Archive, ArchiveRestore, Newspaper, Trash2 } from 'lucide-react';

import { ApiError, apiFetch } from '@/lib/api';
import { useConfirmDialog } from '@/lib/use-confirm-dialog';
import type { Post } from '@/lib/types';
import { AttachmentManager } from '@/components/attachment-manager';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

function statusBadge(visibility: Post['visibility']) {
  if (visibility === 'ARCHIVED') return <Badge>Archived</Badge>;
  if (visibility === 'SCHEDULED') return <Badge tone="gold">Scheduled</Badge>;
  return <Badge tone="emerald">Visible</Badge>;
}

export function PostsTab({ companyId, token }: { companyId: string; token: string }) {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { requestConfirm, dialog } = useConfirmDialog();

  const load = useCallback(() => {
    apiFetch<Post[]>(`/companies/${companyId}/posts`, { token })
      .then((list) => setPosts([...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt))))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load posts'));
  }, [companyId, token]);

  useEffect(load, [load]);

  async function archive(postId: string) {
    await apiFetch(`/posts/${postId}/archive`, { method: 'POST', token });
    load();
  }

  async function restore(postId: string) {
    await apiFetch(`/posts/${postId}/restore`, { method: 'POST', token });
    load();
  }

  async function remove(postId: string) {
    await apiFetch(`/posts/${postId}`, { method: 'DELETE', token });
    load();
  }

  function confirmRemove(post: Post) {
    requestConfirm({
      title: 'Delete post?',
      description: 'This post and its attachments will be permanently removed.',
      onConfirm: () => remove(post.id),
    });
  }

  if (error) {
    return <p className="text-[14.5px] text-fg-muted">{error}</p>;
  }

  if (posts === null) {
    return <div className="h-32 animate-pulse rounded-2xl bg-canvas" />;
  }

  if (posts.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-3 px-6 py-14 text-center">
        <Newspaper className="h-7 w-7 text-fg-faint" strokeWidth={1.5} />
        <p className="text-[14.5px] text-fg-muted">No posts yet.</p>
        <p className="max-w-sm text-[13px] text-fg-faint">
          Posts shared as this company from the feed will show up here.
        </p>
      </Card>
    );
  }

  return (
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

          <AttachmentManager postId={post.id} token={token} />

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

            <button
              onClick={() => confirmRemove(post)}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-fg-muted hover:text-rose-600 dark:hover:text-rose-500"
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </button>
          </div>
        </Card>
      ))}
      {dialog}
    </div>
  );
}
