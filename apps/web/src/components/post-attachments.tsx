import { FileText } from 'lucide-react';

import type { Attachment } from '@/lib/types';

export function PostAttachments({ attachments }: { attachments: Attachment[] }) {
  if (attachments.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      {attachments.map((attachment) => {
        if (attachment.type === 'IMAGE') {
          return (
            <a key={attachment.id} href={attachment.fileUrl} target="_blank" rel="noreferrer">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={attachment.fileUrl}
                alt={attachment.fileName}
                className="max-h-80 w-full rounded-xl border border-line object-cover"
              />
            </a>
          );
        }

        if (attachment.type === 'VIDEO') {
          return (
            <video
              key={attachment.id}
              src={attachment.fileUrl}
              controls
              className="max-h-80 w-full rounded-xl border border-line"
            />
          );
        }

        return (
          <a
            key={attachment.id}
            href={attachment.fileUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-line-strong px-3 py-2 text-[13px] font-medium text-fg hover:border-ink-400"
          >
            <FileText className="h-4 w-4" /> {attachment.fileName}
          </a>
        );
      })}
    </div>
  );
}
