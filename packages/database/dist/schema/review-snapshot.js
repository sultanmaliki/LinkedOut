import { relations } from 'drizzle-orm';
import { jsonb, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { reviews } from './review';
/* ==========================================
 * Review Snapshot
 * ========================================== */
export const reviewSnapshots = pgTable('review_snapshots', {
  id: uuid('id').defaultRandom().primaryKey(),
  reviewId: uuid('review_id')
    .notNull()
    .unique()
    .references(() => reviews.id, {
      onDelete: 'cascade',
    }),
  snapshot: jsonb('snapshot').notNull(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});
/* ==========================================
 * Relations
 * ========================================== */
export const reviewSnapshotsRelations = relations(reviewSnapshots, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewSnapshots.reviewId],
    references: [reviews.id],
  }),
}));
