import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

import { accountStatusEnum, userRoleEnum } from './enums';

/* ==========================================
 * Table
 * ========================================== */

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),

  email: text('email').notNull().unique(),

  emailVerified: boolean('email_verified').default(false).notNull(),

  passwordHash: text('password_hash').notNull(),

  role: userRoleEnum('role').default('PROFESSIONAL').notNull(),

  status: accountStatusEnum('status').default('ACTIVE').notNull(),

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

// export const usersRelations = relations(users, ({ one, many }) => ({
//   ...
// }));

/* ==========================================
 * Types
 * ========================================== */

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
