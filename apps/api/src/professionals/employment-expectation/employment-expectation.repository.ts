import { eq } from 'drizzle-orm';

import { db, employmentExpectations, type NewEmploymentExpectation } from '@linkedout/database';

export type EmploymentExpectationRecord = typeof employmentExpectations.$inferSelect;

export type SetEmploymentExpectationData = Omit<
  NewEmploymentExpectation,
  'id' | 'professionalProfileId' | 'createdAt' | 'updatedAt'
>;

export class EmploymentExpectationRepository {
  async findByProfile(
    professionalProfileId: string,
  ): Promise<EmploymentExpectationRecord | undefined> {
    const [expectation] = await db
      .select()
      .from(employmentExpectations)
      .where(eq(employmentExpectations.professionalProfileId, professionalProfileId))
      .limit(1);

    return expectation;
  }

  async upsert(
    professionalProfileId: string,
    data: SetEmploymentExpectationData,
  ): Promise<EmploymentExpectationRecord> {
    const existing = await this.findByProfile(professionalProfileId);

    if (!existing) {
      const [created] = await db
        .insert(employmentExpectations)
        .values({
          professionalProfileId,
          ...data,
        })
        .returning();

      if (!created) {
        throw new Error('Failed to create employment expectation');
      }

      return created;
    }

    const [updated] = await db
      .update(employmentExpectations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(employmentExpectations.professionalProfileId, professionalProfileId))
      .returning();

    if (!updated) {
      throw new Error('Failed to update employment expectation');
    }

    return updated;
  }
}
