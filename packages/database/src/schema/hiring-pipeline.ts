import { relations } from 'drizzle-orm';
import { index, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { pipelineStageEnum } from './enums';
import { opportunities } from './opportunity';

/* ==========================================
 * Hiring Pipeline
 * ========================================== */

export const hiringPipelines = pgTable(
  'hiring_pipelines',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    opportunityId: uuid('opportunity_id')
      .notNull()
      .references(() => opportunities.id, {
        onDelete: 'cascade',
      }),

    stage: pipelineStageEnum('stage').notNull(),

    // Interview date for the INTERVIEW_SCHEDULED stage; the anchor timer
    // computation counts from once set.
    scheduledAt: timestamp('scheduled_at', {
      withTimezone: true,
    }),

    // Per-stage-entry response window override, in days. Null falls back to
    // the company's default, then the system default, at read time.
    windowDays: integer('window_days'),

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
  },
  (table) => ({
    opportunityIdx: index('hiring_pipelines_opportunity_id_idx').on(table.opportunityId),
  }),
);

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
