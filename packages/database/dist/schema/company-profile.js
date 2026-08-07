import { relations } from 'drizzle-orm';
import { integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { companies } from './company';
/* ==========================================
 * Company Profile
 * ========================================== */
export const companyProfiles = pgTable('company_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id')
    .notNull()
    .unique()
    .references(() => companies.id, {
      onDelete: 'cascade',
    }),
  description: text('description'),
  industry: text('industry'),
  foundedYear: integer('founded_year'),
  employeeCount: integer('employee_count'),
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
export const companyProfilesRelations = relations(companyProfiles, ({ one }) => ({
  company: one(companies, {
    fields: [companyProfiles.companyId],
    references: [companies.id],
  }),
}));
