import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { companyBenefits } from './company-benefit';

/* ==========================================
 * Benefit
 * ========================================== */

export const benefits = pgTable('benefits', {
  id: uuid('id').defaultRandom().primaryKey(),

  name: text('name').notNull().unique(),

  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

/* ==========================================
 * Relations
 * ========================================== */

export const benefitsRelations = relations(benefits, ({ many }) => ({
  companyBenefits: many(companyBenefits),
}));

/* ==========================================
 * Types
 * ========================================== */

export type Benefit = typeof benefits.$inferSelect;

export type NewBenefit = typeof benefits.$inferInsert;
