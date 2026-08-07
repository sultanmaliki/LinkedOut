import { relations } from 'drizzle-orm';
import { boolean, foreignKey, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { companies } from './company';
import { posts } from './post';
import { professionalProfiles } from './professional-profile';
/* ==========================================
 * Comment
 * ========================================== */
export const comments = pgTable(
  'comments',
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
    parentCommentId: uuid('parent_comment_id'),
    content: text('content').notNull(),
    edited: boolean('edited').default(false).notNull(),
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
  },
  (table) => ({
    parentCommentFk: foreignKey({
      columns: [table.parentCommentId],
      foreignColumns: [table.id],
      name: 'comments_parent_comment_fk',
    }).onDelete('cascade'),
  }),
);
/* ==========================================
 * Relations
 * ========================================== */
export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  professionalProfile: one(professionalProfiles, {
    fields: [comments.professionalProfileId],
    references: [professionalProfiles.id],
  }),
  company: one(companies, {
    fields: [comments.companyId],
    references: [companies.id],
  }),
  parentComment: one(comments, {
    fields: [comments.parentCommentId],
    references: [comments.id],
    relationName: 'comment_thread',
  }),
  replies: many(comments, {
    relationName: 'comment_thread',
  }),
}));
