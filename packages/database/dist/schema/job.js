import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { employmentTypeEnum, jobStatusEnum, workModeEnum } from './enums';
import { companies } from './company';
import { companyLocations } from './company-location';
/* ==========================================
 * Job
 * ========================================== */
export const jobs = pgTable('jobs', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id')
    .notNull()
    .references(() => companies.id, {
      onDelete: 'cascade',
    }),
  companyLocationId: uuid('company_location_id').references(() => companyLocations.id, {
    onDelete: 'set null',
  }),
  title: text('title').notNull(),
  description: text('description').notNull(),
  employmentType: employmentTypeEnum('employment_type').notNull(),
  workMode: workModeEnum('work_mode').notNull(),
  openings: integer('openings').default(1).notNull(),
  salaryMin: integer('salary_min'),
  salaryMax: integer('salary_max'),
  currency: text('currency').default('INR').notNull(),
  active: boolean('active').default(true).notNull(),
  status: jobStatusEnum('status').default('ACTIVE').notNull(),
  expiresAt: timestamp('expires_at', {
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
export const jobsRelations = relations(jobs, ({ one }) => ({
  company: one(companies, {
    fields: [jobs.companyId],
    references: [companies.id],
  }),
  companyLocation: one(companyLocations, {
    fields: [jobs.companyLocationId],
    references: [companyLocations.id],
  }),
}));
