import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { professionalProfiles } from './professional-profile';
/* ==========================================
 * Portfolio Links
 * ========================================== */
export const portfolioLinks = pgTable('portfolio_links', {
  id: uuid('id').defaultRandom().primaryKey(),
  professionalProfileId: uuid('professional_profile_id')
    .notNull()
    .references(() => professionalProfiles.id, {
      onDelete: 'cascade',
    }),
  title: text('title').notNull(),
  url: text('url').notNull(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});
/* ==========================================
 * Relations
 * ========================================== */
export const portfolioLinksRelations = relations(portfolioLinks, ({ one }) => ({
  professionalProfile: one(professionalProfiles, {
    fields: [portfolioLinks.professionalProfileId],
    references: [professionalProfiles.id],
  }),
}));
