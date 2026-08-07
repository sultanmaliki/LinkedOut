import { relations } from 'drizzle-orm';
import { boolean, date, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { employmentTypeEnum, workModeEnum } from './enums';

import { professionalProfiles } from './professional-profile';

/* ==========================================
 * Employment History
 * ========================================== */

export const employmentHistories = pgTable('employment_histories', {
  id: uuid('id').defaultRandom().primaryKey(),

  professionalProfileId: uuid('professional_profile_id')
    .notNull()
    .references(() => professionalProfiles.id, {
      onDelete: 'cascade',
    }),

  companyName: text('company_name').notNull(),

  jobTitle: text('job_title').notNull(),

  employmentType: employmentTypeEnum('employment_type').notNull(),

  workMode: workModeEnum('work_mode').notNull(),

  location: text('location'),

  description: text('description'),

  startDate: date('start_date').notNull(),

  endDate: date('end_date'),

  currentlyWorking: boolean('currently_working').default(false).notNull(),

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

export const employmentHistoriesRelations = relations(employmentHistories, ({ one }) => ({
  professionalProfile: one(professionalProfiles, {
    fields: [employmentHistories.professionalProfileId],
    references: [professionalProfiles.id],
  }),
}));

/* ==========================================
 * Types
 * ========================================== */

export type EmploymentHistory = typeof employmentHistories.$inferSelect;

export type NewEmploymentHistory = typeof employmentHistories.$inferInsert;
