import { relations } from 'drizzle-orm';
import { boolean, integer, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { companyTypeEnum, verificationStatusEnum } from './enums';

/* ==========================================
 * Company
 * ========================================== */

export const companies = pgTable('companies', {
  id: uuid('id').defaultRandom().primaryKey(),

  legalName: text('legal_name').notNull(),

  displayName: text('display_name').notNull(),

  slug: text('slug').notNull().unique(),

  companyType: companyTypeEnum('company_type').notNull(),

  website: text('website'),

  logoUrl: text('logo_url'),

  bannerUrl: text('banner_url'),

  verified: boolean('verified').default(false).notNull(),

  verificationStatus: verificationStatusEnum('verification_status').default('PENDING').notNull(),

  // Default response windows (days) applied to opportunities/offers this
  // company sends, when not overridden per-send. Null falls back to the
  // system default at read time.
  defaultResponseWindowDays: integer('default_response_window_days'),

  defaultOfferWindowDays: integer('default_offer_window_days'),

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

export const companiesRelations = relations(companies, () => ({}));

/* ==========================================
 * Types
 * ========================================== */

export type Company = typeof companies.$inferSelect;

export type NewCompany = typeof companies.$inferInsert;
