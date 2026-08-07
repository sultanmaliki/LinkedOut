import { relations } from 'drizzle-orm';
import { jsonb, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';

import { reviews } from './review';

/* ==========================================
 * Professional Snapshot
 * ========================================== */

export const professionalSnapshots = pgTable('professional_snapshots', {
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

export const professionalSnapshotsRelations = relations(professionalSnapshots, ({ one }) => ({
  review: one(reviews, {
    fields: [professionalSnapshots.reviewId],
    references: [reviews.id],
  }),
}));

/* ==========================================
 * Types
 * ========================================== */

export type ProfessionalSnapshot = typeof professionalSnapshots.$inferSelect;

export type NewProfessionalSnapshot = typeof professionalSnapshots.$inferInsert;
