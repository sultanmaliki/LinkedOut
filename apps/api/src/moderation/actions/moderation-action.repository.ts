import { asc, eq } from 'drizzle-orm';

import { db, moderationActions } from '@linkedout/database';

export type ModerationActionRecord = typeof moderationActions.$inferSelect;

export class ModerationActionRepository {
  async create(
    moderationCaseId: string,
    moderatorId: string,
    action: string,
    notes?: string,
  ): Promise<ModerationActionRecord> {
    const [created] = await db
      .insert(moderationActions)
      .values({ moderationCaseId, moderatorId, action, notes })
      .returning();

    if (!created) {
      throw new Error('Failed to create moderation action');
    }

    return created;
  }

  async listByCase(moderationCaseId: string): Promise<ModerationActionRecord[]> {
    return db
      .select()
      .from(moderationActions)
      .where(eq(moderationActions.moderationCaseId, moderationCaseId))
      .orderBy(asc(moderationActions.createdAt));
  }
}
