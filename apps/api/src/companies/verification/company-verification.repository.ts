import { eq } from 'drizzle-orm';

import { companyVerifications, db } from '@linkedout/database';

export type CompanyVerificationRecord = typeof companyVerifications.$inferSelect;

export interface SubmitCompanyVerificationData {
  businessRegistrationNumber?: string;
  taxIdentificationNumber?: string;
  verificationDocumentUrl?: string;
}

export class CompanyVerificationRepository {
  async findByCompanyId(companyId: string): Promise<CompanyVerificationRecord | undefined> {
    const [verification] = await db
      .select()
      .from(companyVerifications)
      .where(eq(companyVerifications.companyId, companyId))
      .limit(1);

    return verification;
  }

  async upsert(
    companyId: string,
    data: SubmitCompanyVerificationData,
  ): Promise<CompanyVerificationRecord> {
    const existing = await this.findByCompanyId(companyId);

    if (!existing) {
      const [created] = await db
        .insert(companyVerifications)
        .values({
          companyId,
          ...data,
          verificationStatus: 'PENDING',
        })
        .returning();

      if (!created) {
        throw new Error('Failed to create company verification');
      }

      return created;
    }

    const [updated] = await db
      .update(companyVerifications)
      .set({
        ...data,
        verificationStatus: 'PENDING',
        verifiedAt: null,
        rejectionReason: null,
        updatedAt: new Date(),
      })
      .where(eq(companyVerifications.companyId, companyId))
      .returning();

    if (!updated) {
      throw new Error('Failed to update company verification');
    }

    return updated;
  }
}
