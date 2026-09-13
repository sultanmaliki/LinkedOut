import { eq } from 'drizzle-orm';

import { db, trustFlags } from '@linkedout/database';

export type TrustFlagRecord = typeof trustFlags.$inferSelect;

export class TrustFlagRepository {
  async create(
    userId: string,
    targetType: string,
    targetId: string,
    reason: string,
    scoreImpact?: number,
  ): Promise<TrustFlagRecord> {
    const [flag] = await db
      .insert(trustFlags)
      .values({ userId, targetType, targetId, reason, scoreImpact })
      .returning();

    if (!flag) {
      throw new Error('Failed to create trust flag');
    }

    return flag;
  }

  async listByUser(userId: string): Promise<TrustFlagRecord[]> {
    return db.select().from(trustFlags).where(eq(trustFlags.userId, userId));
  }
}
