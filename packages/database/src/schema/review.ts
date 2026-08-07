import { relations } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { companies } from './company';
import { employmentHistories } from './employment-history';

/* ==========================================
 * Review
 * ========================================== */

export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),

  companyId: uuid('company_id')
    .notNull()
    .references(() => companies.id, {
      onDelete: 'cascade',
    }),

  employmentHistoryId: uuid('employment_history_id')
    .notNull()
    .unique()
    .references(() => employmentHistories.id, {
      onDelete: 'cascade',
    }),

  title: text('title').notNull(),

  review: text('review').notNull(),

  anonymous: boolean('anonymous').default(true).notNull(),

  recommended: boolean('recommended').default(true).notNull(),

  edited: boolean('edited').default(false).notNull(),

  publishedAt: timestamp('published_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),

  lastEditedAt: timestamp('last_edited_at', {
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

export const reviewsRelations = relations(reviews, ({ one }) => ({
  company: one(companies, {
    fields: [reviews.companyId],
    references: [companies.id],
  }),

  employmentHistory: one(employmentHistories, {
    fields: [reviews.employmentHistoryId],
    references: [employmentHistories.id],
  }),
}));

/* ==========================================
 * Types
 * ========================================== */

export type Review = typeof reviews.$inferSelect;

export type NewReview = typeof reviews.$inferInsert;
