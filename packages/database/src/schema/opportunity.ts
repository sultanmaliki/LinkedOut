import { relations } from 'drizzle-orm';
import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { opportunityStatusEnum } from './enums';

import { jobs } from './job';
import { professionalProfiles } from './professional-profile';

/* ==========================================
 * Opportunity
 * ========================================== */

export const opportunities = pgTable('opportunities', {
  id: uuid('id').defaultRandom().primaryKey(),

  jobId: uuid('job_id')
    .notNull()
    .references(() => jobs.id, {
      onDelete: 'cascade',
    }),

  professionalProfileId: uuid('professional_profile_id')
    .notNull()
    .references(() => professionalProfiles.id, {
      onDelete: 'cascade',
    }),

  message: text('message'),

  status: opportunityStatusEnum('status').default('PENDING').notNull(),

  acceptedAt: timestamp('accepted_at', {
    withTimezone: true,
  }),

  declinedAt: timestamp('declined_at', {
    withTimezone: true,
  }),

  expiresAt: timestamp('expires_at', {
    withTimezone: true,
  }),

  withdrawnAt: timestamp('withdrawn_at', {
    withTimezone: true,
  }),

  // Per-send override (days) for how long the professional has to respond
  // to this specific opportunity. Null falls back to the company's default,
  // then the system default, at read time.
  responseWindowDays: integer('response_window_days'),

  // Set when the professional explicitly flags a stalled, company-owned
  // stage as unresponsive. This is the one value in the ghosting-detection
  // design that's written proactively rather than computed at read time,
  // because it's a real user action, not an inference.
  manuallyFlaggedUnresponsiveAt: timestamp('manually_flagged_unresponsive_at', {
    withTimezone: true,
  }),

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

export const opportunitiesRelations = relations(opportunities, ({ one }) => ({
  job: one(jobs, {
    fields: [opportunities.jobId],
    references: [jobs.id],
  }),

  professionalProfile: one(professionalProfiles, {
    fields: [opportunities.professionalProfileId],
    references: [professionalProfiles.id],
  }),
}));

/* ==========================================
 * Types
 * ========================================== */

export type Opportunity = typeof opportunities.$inferSelect;

export type NewOpportunity = typeof opportunities.$inferInsert;
