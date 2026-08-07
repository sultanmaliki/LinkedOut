import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { attachmentTypeEnum } from './enums';
import { posts } from './post';

/* ==========================================
 * Attachment
 * ========================================== */

export const attachments = pgTable('attachments', {
  id: uuid('id').defaultRandom().primaryKey(),

  postId: uuid('post_id').references(() => posts.id, {
    onDelete: 'cascade',
  }),

  type: attachmentTypeEnum('type').notNull(),

  fileName: text('file_name').notNull(),

  fileUrl: text('file_url').notNull(),

  mimeType: text('mime_type').notNull(),

  fileSize: integer('file_size').notNull(),

  thumbnailUrl: text('thumbnail_url'),

  isPublic: boolean('is_public').default(true).notNull(),

  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

/* ==========================================
 * Relations
 * ========================================== */

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  post: one(posts, {
    fields: [attachments.postId],
    references: [posts.id],
  }),
}));

/* ==========================================
 * Types
 * ========================================== */

export type Attachment = typeof attachments.$inferSelect;

export type NewAttachment = typeof attachments.$inferInsert;
