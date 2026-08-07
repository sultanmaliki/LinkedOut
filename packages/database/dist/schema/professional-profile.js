import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { users } from './user';
/* ==========================================
 * Professional Profile
 * ========================================== */
export const professionalProfiles = pgTable('professional_profiles', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .unique()
    .references(() => users.id, {
      onDelete: 'cascade',
    }),
  fullName: text('full_name').notNull(),
  headline: text('headline'),
  bio: text('bio'),
  profilePhotoUrl: text('profile_photo_url'),
  bannerPhotoUrl: text('banner_photo_url'),
  currentLocation: text('current_location'),
  personalWebsite: text('personal_website'),
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
export const professionalProfilesRelations = relations(professionalProfiles, ({ one }) => ({
  user: one(users, {
    fields: [professionalProfiles.userId],
    references: [users.id],
  }),
}));
