import { relations } from 'drizzle-orm';
import { pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';

import { companies } from './company';
import { users } from './user';

/* ==========================================
 * Company Admin
 * ========================================== */

export const companyAdmins = pgTable(
  'company_admins',
  {
    companyId: uuid('company_id')
      .notNull()
      .references(() => companies.id, {
        onDelete: 'cascade',
      }),

    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, {
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
      columns: [table.companyId, table.userId],
    }),
  }),
);

/* ==========================================
 * Relations
 * ========================================== */

export const companyAdminsRelations = relations(companyAdmins, ({ one }) => ({
  company: one(companies, {
    fields: [companyAdmins.companyId],
    references: [companies.id],
  }),

  user: one(users, {
    fields: [companyAdmins.userId],
    references: [users.id],
  }),
}));

/* ==========================================
 * Types
 * ========================================== */

export type CompanyAdmin = typeof companyAdmins.$inferSelect;

export type NewCompanyAdmin = typeof companyAdmins.$inferInsert;
