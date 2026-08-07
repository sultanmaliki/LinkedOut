import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { verificationStatusEnum } from './enums';
import { companies } from './company';

/* ==========================================
 * Company Verification
 * ========================================== */

export const companyVerifications = pgTable('company_verifications', {
  id: uuid('id').defaultRandom().primaryKey(),

  companyId: uuid('company_id')
    .notNull()
    .unique()
    .references(() => companies.id, {
      onDelete: 'cascade',
    }),

  businessRegistrationNumber: text('business_registration_number'),

  taxIdentificationNumber: text('tax_identification_number'),

  verificationDocumentUrl: text('verification_document_url'),

  verificationStatus: verificationStatusEnum('verification_status').default('PENDING').notNull(),

  verifiedAt: timestamp('verified_at', {
    withTimezone: true,
  }),

  rejectionReason: text('rejection_reason'),

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

export const companyVerificationsRelations = relations(companyVerifications, ({ one }) => ({
  company: one(companies, {
    fields: [companyVerifications.companyId],
    references: [companies.id],
  }),
}));

/* ==========================================
 * Types
 * ========================================== */

export type CompanyVerification = typeof companyVerifications.$inferSelect;

export type NewCompanyVerification = typeof companyVerifications.$inferInsert;
