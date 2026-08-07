import { relations } from 'drizzle-orm';
import { integer, pgTable, primaryKey, text, uuid } from 'drizzle-orm/pg-core';

import { reviews } from './review';

/* ==========================================
 * Review Rating
 * ========================================== */

export const reviewRatings = pgTable(
  'review_ratings',
  {
    reviewId: uuid('review_id')
      .notNull()
      .references(() => reviews.id, {
        onDelete: 'cascade',
      }),

    category: text('category').notNull(),

    score: integer('score').notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.reviewId, table.category],
    }),
  }),
);

/* ==========================================
 * Relations
 * ========================================== */

export const reviewRatingsRelations = relations(reviewRatings, ({ one }) => ({
  review: one(reviews, {
    fields: [reviewRatings.reviewId],
    references: [reviews.id],
  }),
}));

/* ==========================================
 * Types
 * ========================================== */

export type ReviewRating = typeof reviewRatings.$inferSelect;

export type NewReviewRating = typeof reviewRatings.$inferInsert;
