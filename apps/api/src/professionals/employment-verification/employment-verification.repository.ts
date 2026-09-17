import { and, eq } from 'drizzle-orm';

import {
  db,
  employmentHistories,
  employmentVerifications,
  professionalProfiles,
} from '@linkedout/database';

export type EmploymentVerificationRecord = typeof employmentVerifications.$inferSelect;

export interface PendingEmploymentVerification extends EmploymentVerificationRecord {
  professionalProfileId: string;
  professionalFullName: string;
  companyName: string;
  jobTitle: string;
}

export interface SubmitEmploymentVerificationData {
  companyEmail?: string;
  employeeId?: string;
  idCardUrl?: string;
}

export interface ReviewEmploymentVerificationData {
  verificationStatus: 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
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

  async listPending(): Promise<PendingEmploymentVerification[]> {
    return db
      .select({
        id: employmentVerifications.id,
        employmentHistoryId: employmentVerifications.employmentHistoryId,
        companyEmail: employmentVerifications.companyEmail,
        employeeId: employmentVerifications.employeeId,
        idCardUrl: employmentVerifications.idCardUrl,
        verificationStatus: employmentVerifications.verificationStatus,
        verifiedAt: employmentVerifications.verifiedAt,
        rejectionReason: employmentVerifications.rejectionReason,
        createdAt: employmentVerifications.createdAt,
        updatedAt: employmentVerifications.updatedAt,
        professionalProfileId: employmentHistories.professionalProfileId,
        professionalFullName: professionalProfiles.fullName,
        companyName: employmentHistories.companyName,
        jobTitle: employmentHistories.jobTitle,
      })
      .from(employmentVerifications)
      .innerJoin(
        employmentHistories,
        eq(employmentHistories.id, employmentVerifications.employmentHistoryId),
      )
      .innerJoin(
        professionalProfiles,
        eq(professionalProfiles.id, employmentHistories.professionalProfileId),
      )
      .where(eq(employmentVerifications.verificationStatus, 'PENDING'))
      .orderBy(employmentVerifications.createdAt);
  }

  async review(
    id: string,
    data: ReviewEmploymentVerificationData,
  ): Promise<EmploymentVerificationRecord | undefined> {
    const [updated] = await db
      .update(employmentVerifications)
      .set({
        verificationStatus: data.verificationStatus,
        verifiedAt: data.verificationStatus === 'VERIFIED' ? new Date() : null,
        rejectionReason:
          data.verificationStatus === 'REJECTED' ? (data.rejectionReason ?? null) : null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(employmentVerifications.id, id),
          eq(employmentVerifications.verificationStatus, 'PENDING'),
        ),
      )
      .returning();

    return updated;
  }
}
