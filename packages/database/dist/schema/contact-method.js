import { relations } from 'drizzle-orm';
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { contactMethodTypeEnum } from './enums';
import { professionalResponses } from './professional-response';
/* ==========================================
 * Contact Method
 * ========================================== */
export const contactMethods = pgTable('contact_methods', {
  id: uuid('id').defaultRandom().primaryKey(),
  professionalResponseId: uuid('professional_response_id')
    .notNull()
    .unique()
    .references(() => professionalResponses.id, {
      onDelete: 'cascade',
    }),
  type: contactMethodTypeEnum('type').notNull(),
  value: text('value').notNull(),
  sharedAt: timestamp('shared_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
  expiresAt: timestamp('expires_at', {
    withTimezone: true,
  }),
  deletedAt: timestamp('deleted_at', {
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
export const contactMethodsRelations = relations(contactMethods, ({ one }) => ({
  professionalResponse: one(professionalResponses, {
    fields: [contactMethods.professionalResponseId],
    references: [professionalResponses.id],
  }),
}));
