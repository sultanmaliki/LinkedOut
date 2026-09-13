import { eq } from 'drizzle-orm';

import { benefits, companyBenefits, db } from '@linkedout/database';

export interface CompanyBenefitRecord {
  id: string;
  name: string;
}

export class CompanyBenefitRepository {
  async listByCompany(companyId: string): Promise<CompanyBenefitRecord[]> {
    return db
      .select({ id: benefits.id, name: benefits.name })
      .from(companyBenefits)
      .innerJoin(benefits, eq(benefits.id, companyBenefits.benefitId))
      .where(eq(companyBenefits.companyId, companyId));
  }

  async replaceForCompany(
    companyId: string,
    benefitNames: string[],
  ): Promise<CompanyBenefitRecord[]> {
    return db.transaction(async (tx) => {
      const uniqueNames = [...new Set(benefitNames.map((name) => name.trim()).filter(Boolean))];

      const benefitRows: CompanyBenefitRecord[] = [];

      for (const name of uniqueNames) {
        const [existing] = await tx.select().from(benefits).where(eq(benefits.name, name)).limit(1);

        if (existing) {
          benefitRows.push(existing);
          continue;
        }

        const [created] = await tx.insert(benefits).values({ name }).returning();

        if (!created) {
          throw new Error(`Failed to create benefit "${name}"`);
        }

        benefitRows.push(created);
      }

      await tx.delete(companyBenefits).where(eq(companyBenefits.companyId, companyId));

      if (benefitRows.length > 0) {
        await tx.insert(companyBenefits).values(
          benefitRows.map((benefit) => ({
            companyId,
            benefitId: benefit.id,
          })),
        );
      }

      return benefitRows;
    });
  }
}
