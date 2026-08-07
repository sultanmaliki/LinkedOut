import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { opportunities } from './opportunity';

/* ==========================================
 * Hiring Pipeline
 * ========================================== */

export const hiringPipelines = pgTable('hiring_pipelines', {
  id: uuid('id').defaultRandom().primaryKey(),

  opportunityId: uuid('opportunity_id')
    .notNull()
    .references(() => opportunities.id, {
      onDelete: 'cascade',
    }),

  stage: text('stage').notNull(),

  notes: text('notes'),

  changedAt: timestamp('changed_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

/* ==========================================
 * Relations
 * ========================================== */

export const hiringPipelinesRelations = relations(hiringPipelines, ({ one }) => ({
  opportunity: one(opportunities, {
    fields: [hiringPipelines.opportunityId],
    references: [opportunities.id],
  }),
}));

/* ==========================================
 * Types
 * ========================================== */

export type HiringPipeline = typeof hiringPipelines.$inferSelect;

export type NewHiringPipeline = typeof hiringPipelines.$inferInsert;
