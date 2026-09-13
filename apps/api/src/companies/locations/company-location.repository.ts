import { and, eq } from 'drizzle-orm';

import { companyLocations, db, type NewCompanyLocation } from '@linkedout/database';

export type CompanyLocationRecord = typeof companyLocations.$inferSelect;

export type CreateCompanyLocationData = Omit<
  NewCompanyLocation,
  'id' | 'companyId' | 'createdAt' | 'updatedAt'
>;

export type UpdateCompanyLocationData = Partial<CreateCompanyLocationData>;

export class CompanyLocationRepository {
  async create(companyId: string, data: CreateCompanyLocationData): Promise<CompanyLocationRecord> {
    const [location] = await db
      .insert(companyLocations)
      .values({
        companyId,
        ...data,
      })
      .returning();

    if (!location) {
      throw new Error('Failed to create company location');
    }

    return location;
  }

  async listByCompany(companyId: string): Promise<CompanyLocationRecord[]> {
    return db.select().from(companyLocations).where(eq(companyLocations.companyId, companyId));
  }

  async findById(
    companyId: string,
    locationId: string,
  ): Promise<CompanyLocationRecord | undefined> {
    const [location] = await db
      .select()
      .from(companyLocations)
      .where(and(eq(companyLocations.companyId, companyId), eq(companyLocations.id, locationId)))
      .limit(1);

    return location;
  }

  async updateById(
    companyId: string,
    locationId: string,
    data: UpdateCompanyLocationData,
  ): Promise<CompanyLocationRecord | undefined> {
    const [location] = await db
      .update(companyLocations)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(companyLocations.companyId, companyId), eq(companyLocations.id, locationId)))
      .returning();

    return location;
  }

  async deleteById(companyId: string, locationId: string): Promise<boolean> {
    const deleted = await db
      .delete(companyLocations)
      .where(and(eq(companyLocations.companyId, companyId), eq(companyLocations.id, locationId)))
      .returning({ id: companyLocations.id });

    return deleted.length > 0;
  }
}
