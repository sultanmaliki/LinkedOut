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

  // Holds the jti of the single currently-valid refresh token for this user.
  // Rotated on every successful login/refresh; cleared on logout. A refresh
  // token whose jti doesn't match this value has already been used/revoked.
  activeRefreshTokenId: text('active_refresh_token_id'),

  // Holds the jti of the single currently-valid password-reset token for
  // this user, mirroring activeRefreshTokenId above. Set when a reset is
  // requested, cleared once used -- a reset token whose jti doesn't match
  // this value has already been used or superseded by a newer request.
  passwordResetTokenId: text('password_reset_token_id'),

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
