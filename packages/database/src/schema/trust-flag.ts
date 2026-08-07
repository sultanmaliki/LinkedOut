import { relations } from 'drizzle-orm';
import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { users } from './user';

/* ==========================================
 * Trust Flag
 * ========================================== */

export const trustFlags = pgTable('trust_flags', {
  id: uuid('id').defaultRandom().primaryKey(),

  userId: uuid('user_id').references(() => users.id, {
    onDelete: 'cascade',
  }),

  targetType: text('target_type').notNull(),

  targetId: uuid('target_id').notNull(),

  reason: text('reason').notNull(),

  scoreImpact: integer('score_impact').default(0).notNull(),

  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

/* ==========================================
 * Relations
 * ========================================== */

export const trustFlagsRelations = relations(trustFlags, ({ one }) => ({
  user: one(users, {
    fields: [trustFlags.userId],
    references: [users.id],
  }),
}));

/* ==========================================
 * Types
 * ========================================== */

export type TrustFlag = typeof trustFlags.$inferSelect;

export type NewTrustFlag = typeof trustFlags.$inferInsert;
