import { relations, sql } from 'drizzle-orm';
import { bigint, boolean, char, check, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { employmentTypeEnum, noticePeriodEnum, workModeEnum } from './enums';
import { professionalProfiles } from './professional-profile';
/* ==========================================
 * Employment Expectations
 * ========================================== */
export const employmentExpectations = pgTable(
  'employment_expectations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    professionalProfileId: uuid('professional_profile_id')
      .notNull()
      .unique()
      .references(() => professionalProfiles.id, {
        onDelete: 'cascade',
      }),
    desiredJobTitle: text('desired_job_title').notNull(),
    employmentType: employmentTypeEnum('employment_type').notNull(),
    workMode: workModeEnum('work_mode').notNull(),
    expectedSalaryMin: bigint('expected_salary_min', {
      mode: 'number',
    }),
    expectedSalaryMax: bigint('expected_salary_max', {
      mode: 'number',
    }),
    currency: char('currency', {
      length: 3,
    })
      .default('INR')
      .notNull(),
    noticePeriod: noticePeriodEnum('notice_period').default('NEGOTIABLE').notNull(),
    openToRelocation: boolean('open_to_relocation').default(false).notNull(),
    activelyLooking: boolean('actively_looking').default(true).notNull(),
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
  (table) => [
    check(
      'salary_range_check',
      sql`
        ${table.expectedSalaryMin} IS NULL
        OR ${table.expectedSalaryMax} IS NULL
        OR ${table.expectedSalaryMin} <= ${table.expectedSalaryMax}
      `,
    ),
  ],
);
/* ==========================================
 * Relations
 * ========================================== */
export const employmentExpectationsRelations = relations(employmentExpectations, ({ one }) => ({
  professionalProfile: one(professionalProfiles, {
    fields: [employmentExpectations.professionalProfileId],
    references: [professionalProfiles.id],
  }),
}));
