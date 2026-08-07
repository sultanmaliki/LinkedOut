import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { moderationCases } from './moderation-case';
import { users } from './user';
/* ==========================================
 * Moderation Action
 * ========================================== */
export const moderationActions = pgTable('moderation_actions', {
  id: uuid('id').defaultRandom().primaryKey(),
  moderationCaseId: uuid('moderation_case_id')
    .notNull()
    .references(() => moderationCases.id, {
      onDelete: 'cascade',
    }),
  moderatorId: uuid('moderator_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  action: text('action').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});
/* ==========================================
 * Relations
 * ========================================== */
export const moderationActionsRelations = relations(moderationActions, ({ one }) => ({
  moderationCase: one(moderationCases, {
    fields: [moderationActions.moderationCaseId],
    references: [moderationCases.id],
  }),
  moderator: one(users, {
    fields: [moderationActions.moderatorId],
    references: [users.id],
  }),
}));
