'use client';

import { useEffect, useState } from 'react';
import { Heart, MessageCircle } from 'lucide-react';

import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/cn';
import type { Attachment, Post } from '@/lib/types';
import { AuthorBadge } from '@/components/author-badge';
import { useLoginPrompt } from '@/components/login-prompt';
import { PostAttachments } from '@/components/post-attachments';
import { ReportButton } from '@/components/report-button';
import { Card } from '@/components/ui/card';
import { CommentThread } from './comment-thread';

export function PostCard({ post }: { post: Post }) {
  const { accessToken } = useAuth();
  const promptLogin = useLoginPrompt();
  const [likeCount, setLikeCount] = useState<number | null>(null);
  const [liked, setLiked] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    apiFetch<{ count: number; liked: boolean }>(`/posts/${post.id}/like`).then((res) => {
      setLikeCount(res.count);
      setLiked(res.liked);
    });
    apiFetch<Attachment[]>(`/posts/${post.id}/attachments`)
      .then(setAttachments)
      .catch(() => setAttachments([]));
  }, [post.id]);

  async function toggleLike() {
    if (!accessToken) {
      promptLogin('Log in to like posts.');
      return;
    }
    const res = await apiFetch<{ liked: boolean }>(`/posts/${post.id}/like`, {
      method: 'POST',
      token: accessToken,
      body: {},
    });
    setLiked(res.liked);
    setLikeCount((count) => (count ?? 0) + (res.liked ? 1 : -1));
  }

  return (
    <Card className="p-5">
      <AuthorBadge professionalProfileId={post.professionalProfileId} companyId={post.companyId} />

      <p className="mt-3 whitespace-pre-line text-[14.5px] leading-relaxed text-fg">
        {post.content}
      </p>

      <PostAttachments attachments={attachments} />

      <p className="mt-3 text-[12px] text-fg-faint">
        {new Date(post.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
        {post.updatedAt && post.updatedAt !== post.createdAt && (
          <>
            {' · '}
            edited{' '}
            {new Date(post.updatedAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </>
        )}
      </p>

      <div className="mt-3 flex items-center gap-4 border-t border-line pt-3">
        <button
          onClick={toggleLike}
          className={cn(
            'inline-flex items-center gap-1.5 text-[13px] font-medium transition-colors',
            liked ? 'text-rose-600 dark:text-rose-500' : 'text-fg-muted hover:text-fg',
          )}
        >
          <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
          {likeCount === null ? (
            <span className="inline-block h-3 w-3 animate-pulse rounded bg-ink-100 dark:bg-ink-800" />
          ) : (
            likeCount
          )}
        </button>
        <button
          onClick={() => setShowComments((v) => !v)}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-fg-muted hover:text-fg"
        >
          <MessageCircle className="h-4 w-4" />
          Comments
        </button>

        <div className="ml-auto">
          <ReportButton targetType="POST" targetId={post.id} />
        </div>
      </div>

      {showComments && <CommentThread postId={post.id} />}
    </Card>
  );
}
