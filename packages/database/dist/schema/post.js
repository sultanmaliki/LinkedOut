import { relations } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { postVisibilityEnum } from './enums';
import { companies } from './company';
import { professionalProfiles } from './professional-profile';
/* ==========================================
 * Post
 * ========================================== */
export const posts = pgTable('posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  professionalProfileId: uuid('professional_profile_id').references(() => professionalProfiles.id, {
    onDelete: 'cascade',
  }),
  companyId: uuid('company_id').references(() => companies.id, {
    onDelete: 'cascade',
  }),
  content: text('content'),
  visibility: postVisibilityEnum('visibility').default('VISIBLE_NOW').notNull(),
  scheduledAt: timestamp('scheduled_at', {
    withTimezone: true,
  }),
  deleteAt: timestamp('delete_at', {
    withTimezone: true,
  }),
  archivedAt: timestamp('archived_at', {
    withTimezone: true,
  }),
  archivedBefore: boolean('archived_before').default(false).notNull(),
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
export const postsRelations = relations(posts, ({ one }) => ({
  professionalProfile: one(professionalProfiles, {
    fields: [posts.professionalProfileId],
    references: [professionalProfiles.id],
  }),
  company: one(companies, {
    fields: [posts.companyId],
    references: [companies.id],
  }),
}));
