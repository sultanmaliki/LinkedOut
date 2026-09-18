'use client';

import { useEffect, useState } from 'react';
import { Paperclip, Trash2 } from 'lucide-react';

import { ApiError, apiFetch } from '@/lib/api';
import { useConfirmDialog } from '@/lib/use-confirm-dialog';
import type { Attachment, AttachmentType } from '@/lib/types';
import { PostAttachments } from '@/components/post-attachments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const ATTACHMENT_TYPES: AttachmentType[] = ['IMAGE', 'VIDEO', 'PDF'];

const MIME_TYPE_BY_ATTACHMENT_TYPE: Record<AttachmentType, string> = {
  IMAGE: 'image/jpeg',
  VIDEO: 'video/mp4',
  PDF: 'application/pdf',
};

function fileNameFromUrl(url: string): string {
  try {
    const path = new URL(url).pathname;
    return path.split('/').filter(Boolean).pop() || 'attachment';
  } catch {
    return 'attachment';
  }
}

export function AttachmentManager({ postId, token }: { postId: string; token: string }) {
  const [attachments, setAttachments] = useState<Attachment[] | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [type, setType] = useState<AttachmentType>('IMAGE');
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { requestConfirm, dialog } = useConfirmDialog();

  function load() {
    apiFetch<Attachment[]>(`/posts/${postId}/attachments`).then(setAttachments);
  }

  useEffect(load, [postId]);

  async function addAttachment() {
    if (!url.trim()) return;
    setError(null);
    setIsSubmitting(true);

    try {
      await apiFetch(`/posts/${postId}/attachments`, {
        method: 'POST',
        token,
        body: {
          type,
          fileName: fileNameFromUrl(url),
          fileUrl: url.trim(),
          mimeType: MIME_TYPE_BY_ATTACHMENT_TYPE[type],
          // We don't upload the file ourselves — just the URL the user
          // pasted — so there's no real size to report. See fileSize on
          // CreateAttachmentDto.
          fileSize: 1,
        },
      });
      setUrl('');
      setIsAdding(false);
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to add attachment');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function removeAttachment(attachmentId: string) {
    await apiFetch(`/posts/${postId}/attachments/${attachmentId}`, { method: 'DELETE', token });
    load();
  }

  function confirmRemoveAttachment(attachment: Attachment) {
    requestConfirm({
      title: 'Remove attachment?',
      description: `"${attachment.fileName}" will be removed from this post.`,
      confirmLabel: 'Remove',
      onConfirm: () => removeAttachment(attachment.id),
    });
  }

  if (attachments === null) {
    return <div className="mt-3 h-6 animate-pulse rounded bg-canvas" />;
  }

  return (
    <div className="mt-3 border-t border-line pt-3">
      {attachments.length > 0 && (
        <div className="mb-2 space-y-2">
          <PostAttachments attachments={attachments} />
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <button
                key={attachment.id}
                type="button"
                onClick={() => confirmRemoveAttachment(attachment)}
                className="inline-flex items-center gap-1 text-[12px] font-medium text-fg-faint hover:text-rose-600"
              >
                <Trash2 className="h-3 w-3" /> Remove {attachment.fileName}
              </button>
            ))}
          </div>
        </div>
      )}

      {isAdding ? (
        <div className="space-y-2 rounded-xl border border-line-strong bg-canvas p-3">
          <div className="flex items-center gap-2">
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as AttachmentType)}
              className="w-auto"
            >
              {ATTACHMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t[0] + t.slice(1).toLowerCase()}
                </option>
              ))}
            </Select>
          </div>
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
            className="text-[13.5px]"
          />
          {error && <p className="text-[12px] text-rose-600 dark:text-rose-500">{error}</p>}
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={addAttachment} disabled={isSubmitting}>
              {isSubmitting ? 'Adding…' : 'Add'}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setIsAdding(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-fg-faint hover:text-fg"
        >
          <Paperclip className="h-3.5 w-3.5" /> Add attachment
        </button>
      )}

      {dialog}
    </div>
  );
}
