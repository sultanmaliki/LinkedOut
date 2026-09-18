'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Paperclip, X } from 'lucide-react';

import { ApiError, apiFetch } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import type { AttachmentType, Company, Post } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardBody } from '@/components/ui/card';
import { Input, Textarea } from '@/components/ui/input';
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

export function ComposeBox({ onPosted }: { onPosted: () => void }) {
  const { user, accessToken } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [asCompanyId, setAsCompanyId] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isAttaching, setIsAttaching] = useState(false);
  const [attachmentType, setAttachmentType] = useState<AttachmentType>('IMAGE');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  useEffect(() => {
    if (!accessToken) return;
    apiFetch<Company[]>('/companies/mine', { token: accessToken })
      .then(setCompanies)
      .catch(() => setCompanies([]));
  }, [accessToken]);

  if (!user) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const post = await apiFetch<Post>('/posts', {
        method: 'POST',
        token: accessToken,
        body: { content, asCompanyId: asCompanyId || undefined },
      });

      if (isAttaching && attachmentUrl.trim()) {
        await apiFetch(`/posts/${post.id}/attachments`, {
          method: 'POST',
          token: accessToken,
          body: {
            type: attachmentType,
            fileName: fileNameFromUrl(attachmentUrl),
            fileUrl: attachmentUrl.trim(),
            mimeType: MIME_TYPE_BY_ATTACHMENT_TYPE[attachmentType],
            // We don't upload the file ourselves — just the URL the user
            // pasted — so there's no real size to report. See fileSize on
            // CreateAttachmentDto.
            fileSize: 1,
          },
        });
      }

      setContent('');
      setIsAttaching(false);
      setAttachmentUrl('');
      onPosted();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Failed to publish post');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="mb-6">
      <CardBody className="pt-5">
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            rows={3}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share an update, a win, or something worth discussing…"
          />

          {isAttaching ? (
            <div className="space-y-2 rounded-xl border border-line-strong bg-canvas p-3">
              <div className="flex items-center gap-2">
                <Select
                  value={attachmentType}
                  onChange={(e) => setAttachmentType(e.target.value as AttachmentType)}
                  className="w-auto"
                >
                  {ATTACHMENT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type[0] + type.slice(1).toLowerCase()}
                    </option>
                  ))}
                </Select>
                <button
                  type="button"
                  onClick={() => {
                    setIsAttaching(false);
                    setAttachmentUrl('');
                  }}
                  className="ml-auto rounded-full p-1.5 text-fg-faint hover:text-rose-600"
                  aria-label="Remove attachment"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <Input
                type="url"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                placeholder="https://…"
                className="text-[13.5px]"
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAttaching(true)}
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-fg-muted hover:text-fg"
            >
              <Paperclip className="h-3.5 w-3.5" /> Attach a file
            </button>
          )}

          <div className="flex items-center justify-between gap-3">
            {companies.length > 0 ? (
              <Select
                className="w-auto"
                value={asCompanyId}
                onChange={(e) => setAsCompanyId(e.target.value)}
              >
                <option value="">Posting as {user.name}</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    Posting as {company.displayName}
                  </option>
                ))}
              </Select>
            ) : (
              <span className="text-[13px] text-fg-faint">Posting as {user.name}</span>
            )}
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Posting…' : 'Post'}
            </Button>
          </div>
          {error && <p className="text-[13px] text-rose-600 dark:text-rose-500">{error}</p>}
        </form>
      </CardBody>
    </Card>
  );
}
