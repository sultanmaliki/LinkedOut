import { relations } from 'drizzle-orm';
import { boolean, pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { opportunities } from './opportunity';

/* ==========================================
 * Professional Response
 * ========================================== */

export const professionalResponses = pgTable('professional_responses', {
  id: uuid('id').defaultRandom().primaryKey(),

  opportunityId: uuid('opportunity_id')
    .notNull()
    .unique()
    .references(() => opportunities.id, {
      onDelete: 'cascade',
    }),

  accepted: boolean('accepted').notNull(),

  message: varchar('message', {
    length: 250,
  }),

  respondedAt: timestamp('responded_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

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
});

/* ==========================================
 * Relations
 * ========================================== */

export const professionalResponsesRelations = relations(professionalResponses, ({ one }) => ({
  opportunity: one(opportunities, {
    fields: [professionalResponses.opportunityId],
    references: [opportunities.id],
  }),
}));

/* ==========================================
 * Types
 * ========================================== */

export type ProfessionalResponse = typeof professionalResponses.$inferSelect;

export type NewProfessionalResponse = typeof professionalResponses.$inferInsert;
