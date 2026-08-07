import { relations } from 'drizzle-orm';
import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { companies } from './company';
/* ==========================================
 * Company Location
 * ========================================== */
export const companyLocations = pgTable('company_locations', {
  id: uuid('id').defaultRandom().primaryKey(),
  companyId: uuid('company_id')
    .notNull()
    .references(() => companies.id, {
      onDelete: 'cascade',
    }),
  locationName: text('location_name').notNull(),
  country: text('country').notNull(),
  state: text('state'),
  city: text('city'),
  address: text('address'),
  postalCode: text('postal_code'),
  isHeadquarters: boolean('is_headquarters').default(false).notNull(),
  isRemote: boolean('is_remote').default(false).notNull(),
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
export const companyLocationsRelations = relations(companyLocations, ({ one }) => ({
  company: one(companies, {
    fields: [companyLocations.companyId],
    references: [companies.id],
  }),
}));
