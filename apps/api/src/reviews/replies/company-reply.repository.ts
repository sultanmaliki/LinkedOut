import { eq } from 'drizzle-orm';

import { companyReplies, db } from '@linkedout/database';

export type CompanyReplyRecord = typeof companyReplies.$inferSelect;

export class CompanyReplyRepository {
  async findByReviewId(reviewId: string): Promise<CompanyReplyRecord | undefined> {
    const [reply] = await db
      .select()
      .from(companyReplies)
      .where(eq(companyReplies.reviewId, reviewId))
      .limit(1);

    return reply;
  }

  async create(reviewId: string, reply: string): Promise<CompanyReplyRecord> {
    const [created] = await db.insert(companyReplies).values({ reviewId, reply }).returning();

    if (!created) {
      throw new Error('Failed to create company reply');
    }

    return created;
  }

  async updateByReviewId(reviewId: string, reply: string): Promise<CompanyReplyRecord | undefined> {
    const [updated] = await db
      .update(companyReplies)
      .set({ reply, edited: true, updatedAt: new Date() })
      .where(eq(companyReplies.reviewId, reviewId))
      .returning();

    return updated;
  }
}
