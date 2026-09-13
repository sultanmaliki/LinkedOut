import { and, eq, isNull } from 'drizzle-orm';

import { db, likes } from '@linkedout/database';

export type LikeRecord = typeof likes.$inferSelect;

export interface LikeActor {
  professionalProfileId: string | null;
  companyId: string | null;
}

export class LikeRepository {
  async findByActor(postId: string, actor: LikeActor): Promise<LikeRecord | undefined> {
    const [like] = await db
      .select()
      .from(likes)
      .where(
        and(
          eq(likes.postId, postId),
          actor.professionalProfileId
            ? eq(likes.professionalProfileId, actor.professionalProfileId)
            : isNull(likes.professionalProfileId),
          actor.companyId ? eq(likes.companyId, actor.companyId) : isNull(likes.companyId),
        ),
      )
      .limit(1);

    return like;
  }

  async create(postId: string, actor: LikeActor): Promise<LikeRecord> {
    const [like] = await db
      .insert(likes)
      .values({
        postId,
        professionalProfileId: actor.professionalProfileId,
        companyId: actor.companyId,
      })
      .returning();

    if (!like) {
      throw new Error('Failed to create like');
    }

    return like;
  }

  async deleteByActor(postId: string, actor: LikeActor): Promise<void> {
    await db
      .delete(likes)
      .where(
        and(
          eq(likes.postId, postId),
          actor.professionalProfileId
            ? eq(likes.professionalProfileId, actor.professionalProfileId)
            : isNull(likes.professionalProfileId),
          actor.companyId ? eq(likes.companyId, actor.companyId) : isNull(likes.companyId),
        ),
      );
  }

  async countByPost(postId: string): Promise<number> {
    const rows = await db
      .select({ postId: likes.postId })
      .from(likes)
      .where(eq(likes.postId, postId));

    return rows.length;
  }
}
