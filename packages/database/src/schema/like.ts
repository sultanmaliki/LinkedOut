import { relations } from 'drizzle-orm';
import { pgTable, timestamp, uniqueIndex, uuid } from 'drizzle-orm/pg-core';

import { companies } from './company';
import { posts } from './post';
import { professionalProfiles } from './professional-profile';

/* ==========================================
 * Like
 * ========================================== */

export const likes = pgTable(
  'likes',
  {
    id: uuid('id').defaultRandom().primaryKey(),

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
    // Not a true uniqueness guarantee: Postgres treats NULLs as distinct in a
    // unique index, so this cannot by itself prevent duplicate likes from the
    // same actor when professionalProfileId or companyId is null. The
    // application layer (LikeRepository.findByActor) enforces that instead.
    actorIndex: uniqueIndex('likes_post_professional_company_idx').on(
      table.postId,
      table.professionalProfileId,
      table.companyId,
    ),
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

/* ==========================================
 * Types
 * ========================================== */

export type Like = typeof likes.$inferSelect;

export type NewLike = typeof likes.$inferInsert;
