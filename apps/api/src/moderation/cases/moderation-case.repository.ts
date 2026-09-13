import { eq } from 'drizzle-orm';

import { db, moderationCases, type NewModerationCase } from '@linkedout/database';

export type ModerationCaseRecord = typeof moderationCases.$inferSelect;

export type CreateModerationCaseData = Omit<
  NewModerationCase,
  'id' | 'reporterId' | 'status' | 'createdAt' | 'updatedAt'
>;

export class ModerationCaseRepository {
  async create(reporterId: string, data: CreateModerationCaseData): Promise<ModerationCaseRecord> {
    const [moderationCase] = await db
      .insert(moderationCases)
      .values({ reporterId, ...data })
      .returning();

    if (!moderationCase) {
      throw new Error('Failed to create moderation case');
    }

    return moderationCase;
  }

  async findById(caseId: string): Promise<ModerationCaseRecord | undefined> {
    const [moderationCase] = await db
      .select()
      .from(moderationCases)
      .where(eq(moderationCases.id, caseId))
      .limit(1);

    return moderationCase;
  }

  async list(): Promise<ModerationCaseRecord[]> {
    return db.select().from(moderationCases);
  }

  async updateStatus(
    caseId: string,
    status: ModerationCaseRecord['status'],
  ): Promise<ModerationCaseRecord | undefined> {
    const [moderationCase] = await db
      .update(moderationCases)
      .set({ status, updatedAt: new Date() })
      .where(eq(moderationCases.id, caseId))
      .returning();

    return moderationCase;
  }
}
