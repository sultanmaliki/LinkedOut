import { and, eq } from 'drizzle-orm';

import { db, employmentHistories, type NewEmploymentHistory } from '@linkedout/database';

export type EmploymentHistoryRecord = typeof employmentHistories.$inferSelect;

export type CreateEmploymentHistoryData = Omit<
  NewEmploymentHistory,
  'id' | 'professionalProfileId' | 'createdAt' | 'updatedAt'
>;

export type UpdateEmploymentHistoryData = Partial<CreateEmploymentHistoryData>;

export class EmploymentHistoryRepository {
  async create(
    professionalProfileId: string,
    data: CreateEmploymentHistoryData,
  ): Promise<EmploymentHistoryRecord> {
    const [history] = await db
      .insert(employmentHistories)
      .values({
        professionalProfileId,
        ...data,
      })
      .returning();

    if (!history) {
      throw new Error('Failed to create employment history');
    }

    return history;
  }

  async listByProfile(professionalProfileId: string): Promise<EmploymentHistoryRecord[]> {
    return db
      .select()
      .from(employmentHistories)
      .where(eq(employmentHistories.professionalProfileId, professionalProfileId));
  }

  async findById(
    professionalProfileId: string,
    historyId: string,
  ): Promise<EmploymentHistoryRecord | undefined> {
    const [history] = await db
      .select()
      .from(employmentHistories)
      .where(
        and(
          eq(employmentHistories.professionalProfileId, professionalProfileId),
          eq(employmentHistories.id, historyId),
        ),
      )
      .limit(1);

    return history;
  }

  async updateById(
    professionalProfileId: string,
    historyId: string,
    data: UpdateEmploymentHistoryData,
  ): Promise<EmploymentHistoryRecord | undefined> {
    const [history] = await db
      .update(employmentHistories)
      .set({ ...data, updatedAt: new Date() })
      .where(
        and(
          eq(employmentHistories.professionalProfileId, professionalProfileId),
          eq(employmentHistories.id, historyId),
        ),
      )
      .returning();

    return history;
  }

  async deleteById(professionalProfileId: string, historyId: string): Promise<boolean> {
    const deleted = await db
      .delete(employmentHistories)
      .where(
        and(
          eq(employmentHistories.professionalProfileId, professionalProfileId),
          eq(employmentHistories.id, historyId),
        ),
      )
      .returning({ id: employmentHistories.id });

    return deleted.length > 0;
  }
}
