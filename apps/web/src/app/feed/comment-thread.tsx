'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { CornerDownRight } from 'lucide-react';

import { apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { Comment } from '@/lib/types';
import { AuthorBadge } from '@/components/author-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function CommentThread({ postId }: { postId: string }) {
  const { user, accessToken } = useAuth();
  const [comments, setComments] = useState<Comment[] | null>(null);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  function load() {
    apiFetch<Comment[]>(`/posts/${postId}/comments`).then(setComments);
  }

  useEffect(load, [postId]);

  if (!comments) {
    return <div className="mt-3 h-6 animate-pulse rounded bg-canvas" />;
  }

  const topLevel = comments.filter((c) => !c.parentCommentId);
  const repliesOf = (id: string) => comments.filter((c) => c.parentCommentId === id);

  return (
    <div className="mt-4 space-y-3 border-t border-line pt-4">
      {topLevel.map((comment) => (
        <div key={comment.id} className="space-y-2">
          <CommentRow comment={comment} />
          {repliesOf(comment.id).map((reply) => (
            <div key={reply.id} className="ml-6 flex items-start gap-1.5">
              <CornerDownRight className="mt-1.5 h-3 w-3 shrink-0 text-fg-faint" />
              <CommentRow comment={reply} />
            </div>
          ))}
          {user && (
            <button
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              className="ml-6 text-[12px] font-medium text-fg-faint hover:text-fg"
            >
              Reply
            </button>
          )}
          {replyTo === comment.id && (
            <div className="ml-6">
              <CommentForm
                postId={postId}
                token={accessToken!}
                parentCommentId={comment.id}
                onPosted={() => {
                  setReplyTo(null);
                  load();
                }}
              />
            </div>
          )}
        </div>
      ))}

      {user && <CommentForm postId={postId} token={accessToken!} onPosted={load} />}
    </div>
  );
}

function CommentRow({ comment }: { comment: Comment }) {
  return (
    <div className="flex items-start gap-2.5">
      <AuthorBadge
        professionalProfileId={comment.professionalProfileId}
        companyId={comment.companyId}
        size="sm"
      />
      <p className="mt-0.5 flex-1 text-[13.5px] text-fg-muted">{comment.content}</p>
    </div>
  );
}

function CommentForm({
  postId,
  token,
  parentCommentId,
  onPosted,
}: {
  postId: string;
  token: string;
  parentCommentId?: string;
  onPosted: () => void;
}) {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);

    try {
      await apiFetch(`/posts/${postId}/comments`, {
        method: 'POST',
        token,
        body: { content, parentCommentId },
      });
      setContent('');
      onPosted();
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={parentCommentId ? 'Write a reply…' : 'Write a comment…'}
        className="py-1.5 text-[13.5px]"
      />
      <Button type="submit" size="sm" variant="secondary" disabled={isSubmitting}>
        Send
      </Button>
    </form>
  );
}
