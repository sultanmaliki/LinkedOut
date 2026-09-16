import { relations } from 'drizzle-orm';
import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { moderationReasonEnum, moderationStatusEnum } from './enums';

import { users } from './user';

/* ==========================================
 * Moderation Case
 * ========================================== */

export const moderationCases = pgTable(
  'moderation_cases',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    reporterId: uuid('reporter_id').references(() => users.id, {
      onDelete: 'set null',
    }),

    targetType: text('target_type').notNull(),

    targetId: uuid('target_id').notNull(),

    reason: moderationReasonEnum('reason').notNull(),

    description: text('description'),

    status: moderationStatusEnum('status').default('OPEN').notNull(),

    createdAt: timestamp('created_at', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp('updated_at', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    statusIdx: index('moderation_cases_status_idx').on(table.status),
    targetIdx: index('moderation_cases_target_idx').on(table.targetType, table.targetId),
  }),
);

/* ==========================================
 * Relations
 * ========================================== */

export const moderationCasesRelations = relations(moderationCases, ({ one }) => ({
  reporter: one(users, {
    fields: [moderationCases.reporterId],
    references: [users.id],
  }),
}));

/* ==========================================
 * Types
 * ========================================== */

export type ModerationCase = typeof moderationCases.$inferSelect;

export type NewModerationCase = typeof moderationCases.$inferInsert;
