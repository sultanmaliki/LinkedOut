import { relations } from 'drizzle-orm';
import { pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';
import { companies } from './company';
import { benefits } from './benefit';
/* ==========================================
 * Company Benefit
 * ========================================== */
export const companyBenefits = pgTable(
  'company_benefits',
  {
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, {
        onDelete: 'cascade',
      }),
    benefitId: uuid('benefit_id')
      .notNull()
      .references(() => benefits.id, {
        onDelete: 'cascade',
      }),
    createdAt: timestamp('created_at', {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.companyId, table.benefitId],
    }),
  }),
);
/* ==========================================
 * Relations
 * ========================================== */
export const companyBenefitsRelations = relations(companyBenefits, ({ one }) => ({
  company: one(companies, {
    fields: [companyBenefits.companyId],
    references: [companies.id],
  }),
  benefit: one(benefits, {
    fields: [companyBenefits.benefitId],
    references: [benefits.id],
  }),
}));
