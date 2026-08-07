import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { verificationStatusEnum } from './enums';
import { employmentHistories } from './employment-history';

/* ==========================================
 * Employment Verification
 * ========================================== */

export const employmentVerifications = pgTable('employment_verifications', {
  id: uuid('id').defaultRandom().primaryKey(),

  employmentHistoryId: uuid('employment_history_id')
    .notNull()
    .unique()
    .references(() => employmentHistories.id, {
      onDelete: 'cascade',
    }),

  companyEmail: text('company_email'),

  employeeId: text('employee_id'),

  idCardUrl: text('id_card_url'),

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

export const employmentVerificationsRelations = relations(employmentVerifications, ({ one }) => ({
  employmentHistory: one(employmentHistories, {
    fields: [employmentVerifications.employmentHistoryId],
    references: [employmentHistories.id],
  }),
}));

/* ==========================================
 * Types
 * ========================================== */

export type EmploymentVerification = typeof employmentVerifications.$inferSelect;

export type NewEmploymentVerification = typeof employmentVerifications.$inferInsert;
