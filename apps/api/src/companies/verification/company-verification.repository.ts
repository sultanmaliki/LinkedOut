import { and, eq } from 'drizzle-orm';

import { companies, companyVerifications, db } from '@linkedout/database';

export type CompanyVerificationRecord = typeof companyVerifications.$inferSelect;

export interface PendingCompanyVerification extends CompanyVerificationRecord {
  companyDisplayName: string;
  companyLegalName: string;
}

export interface SubmitCompanyVerificationData {
  businessRegistrationNumber?: string;
  taxIdentificationNumber?: string;
  verificationDocumentUrl?: string;
}

export interface ReviewCompanyVerificationData {
  verificationStatus: 'VERIFIED' | 'REJECTED';
  rejectionReason?: string;
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

  async listPending(): Promise<PendingCompanyVerification[]> {
    return db
      .select({
        id: companyVerifications.id,
        companyId: companyVerifications.companyId,
        businessRegistrationNumber: companyVerifications.businessRegistrationNumber,
        taxIdentificationNumber: companyVerifications.taxIdentificationNumber,
        verificationDocumentUrl: companyVerifications.verificationDocumentUrl,
        verificationStatus: companyVerifications.verificationStatus,
        verifiedAt: companyVerifications.verifiedAt,
        rejectionReason: companyVerifications.rejectionReason,
        createdAt: companyVerifications.createdAt,
        updatedAt: companyVerifications.updatedAt,
        companyDisplayName: companies.displayName,
        companyLegalName: companies.legalName,
      })
      .from(companyVerifications)
      .innerJoin(companies, eq(companies.id, companyVerifications.companyId))
      .where(eq(companyVerifications.verificationStatus, 'PENDING'))
      .orderBy(companyVerifications.createdAt);
  }

  async review(
    id: string,
    data: ReviewCompanyVerificationData,
  ): Promise<CompanyVerificationRecord | undefined> {
    const [updated] = await db
      .update(companyVerifications)
      .set({
        verificationStatus: data.verificationStatus,
        verifiedAt: data.verificationStatus === 'VERIFIED' ? new Date() : null,
        rejectionReason:
          data.verificationStatus === 'REJECTED' ? (data.rejectionReason ?? null) : null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(companyVerifications.id, id),
          eq(companyVerifications.verificationStatus, 'PENDING'),
        ),
      )
      .returning();

    return updated;
  }
}
