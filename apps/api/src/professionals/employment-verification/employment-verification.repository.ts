import { eq } from 'drizzle-orm';

import { db, employmentVerifications } from '@linkedout/database';

export type EmploymentVerificationRecord = typeof employmentVerifications.$inferSelect;

export interface SubmitEmploymentVerificationData {
  companyEmail?: string;
  employeeId?: string;
  idCardUrl?: string;
}

export class EmploymentVerificationRepository {
  async findByHistoryId(
    employmentHistoryId: string,
  ): Promise<EmploymentVerificationRecord | undefined> {
    const [verification] = await db
      .select()
      .from(employmentVerifications)
      .where(eq(employmentVerifications.employmentHistoryId, employmentHistoryId))
      .limit(1);

    return verification;
  }

  async upsert(
    employmentHistoryId: string,
    data: SubmitEmploymentVerificationData,
  ): Promise<EmploymentVerificationRecord> {
    const existing = await this.findByHistoryId(employmentHistoryId);

    if (!existing) {
      const [created] = await db
        .insert(employmentVerifications)
        .values({
          employmentHistoryId,
          ...data,
          verificationStatus: 'PENDING',
        })
        .returning();

      if (!created) {
        throw new Error('Failed to create employment verification');
      }

      return created;
    }

    const [updated] = await db
      .update(employmentVerifications)
      .set({
        ...data,
        verificationStatus: 'PENDING',
        verifiedAt: null,
        rejectionReason: null,
        updatedAt: new Date(),
      })
      .where(eq(employmentVerifications.employmentHistoryId, employmentHistoryId))
      .returning();

    if (!updated) {
      throw new Error('Failed to update employment verification');
    }

    return updated;
  }
}
