import { relations } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { reviews } from './review';

/* ==========================================
 * Company Reply
 * ========================================== */

export const companyReplies = pgTable('company_replies', {
  id: uuid('id').defaultRandom().primaryKey(),

  reviewId: uuid('review_id')
    .notNull()
    .unique()
    .references(() => reviews.id, {
      onDelete: 'cascade',
    }),

  reply: text('reply').notNull(),

  edited: boolean('edited').default(false).notNull(),

  repliedAt: timestamp('replied_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp('updated_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

/* ==========================================
 * Relations
 * ========================================== */

export const companyRepliesRelations = relations(companyReplies, ({ one }) => ({
  review: one(reviews, {
    fields: [companyReplies.reviewId],
    references: [reviews.id],
  }),
}));

/* ==========================================
 * Types
 * ========================================== */

export type CompanyReply = typeof companyReplies.$inferSelect;

export type NewCompanyReply = typeof companyReplies.$inferInsert;
