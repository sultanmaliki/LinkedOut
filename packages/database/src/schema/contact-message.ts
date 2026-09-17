import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

/* ==========================================
 * Contact Message
 * ========================================== */

export const contactMessages = pgTable('contact_messages', {
  id: uuid('id').defaultRandom().primaryKey(),

  name: text('name').notNull(),

  email: text('email').notNull(),

  message: text('message').notNull(),

  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});

/* ==========================================
 * Types
 * ========================================== */

export type ContactMessage = typeof contactMessages.$inferSelect;

export type NewContactMessage = typeof contactMessages.$inferInsert;
