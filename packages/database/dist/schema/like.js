import { relations } from 'drizzle-orm';
import { pgTable, primaryKey, timestamp, uuid } from 'drizzle-orm/pg-core';
import { companies } from './company';
import { posts } from './post';
import { professionalProfiles } from './professional-profile';
/* ==========================================
 * Like
 * ========================================== */
export const likes = pgTable(
  'likes',
  {
    postId: uuid('post_id')
      .notNull()
      .references(() => posts.id, {
        onDelete: 'cascade',
      }),
    professionalProfileId: uuid('professional_profile_id').references(
      () => professionalProfiles.id,
      {
        onDelete: 'cascade',
      },
    ),
    companyId: uuid('company_id').references(() => companies.id, {
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
      columns: [table.postId, table.professionalProfileId, table.companyId],
    }),
  }),
);
/* ==========================================
 * Relations
 * ========================================== */
export const likesRelations = relations(likes, ({ one }) => ({
  post: one(posts, {
    fields: [likes.postId],
    references: [posts.id],
  }),
  professionalProfile: one(professionalProfiles, {
    fields: [likes.professionalProfileId],
    references: [professionalProfiles.id],
  }),
  company: one(companies, {
    fields: [likes.companyId],
    references: [companies.id],
  }),
}));
