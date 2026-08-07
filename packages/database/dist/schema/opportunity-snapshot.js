import { relations } from 'drizzle-orm';
import { jsonb, pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { opportunities } from './opportunity';
/* ==========================================
 * Opportunity Snapshot
 * ========================================== */
export const opportunitySnapshots = pgTable('opportunity_snapshots', {
  id: uuid('id').defaultRandom().primaryKey(),
  opportunityId: uuid('opportunity_id')
    .notNull()
    .unique()
    .references(() => opportunities.id, {
      onDelete: 'cascade',
    }),
  snapshot: jsonb('snapshot').notNull(),
  createdAt: timestamp('created_at', {
    withTimezone: true,
  })
    .defaultNow()
    .notNull(),
});
/* ==========================================
 * Relations
 * ========================================== */
export const opportunitySnapshotsRelations = relations(opportunitySnapshots, ({ one }) => ({
  opportunity: one(opportunities, {
    fields: [opportunitySnapshots.opportunityId],
    references: [opportunities.id],
  }),
}));
