import { and, eq, ilike, inArray, or } from 'drizzle-orm';

import {
  companies,
  companyAdmins,
  companyProfiles,
  db,
  type NewCompany,
  type NewCompanyProfile,
} from '@linkedout/database';

export interface CompanyRecord {
  id: string;
  legalName: string;
  displayName: string;
  slug: string;
  companyType: string;
  website: string | null;
  logoUrl: string | null;
  bannerUrl: string | null;
  verified: boolean;
  verificationStatus: string;
  description: string | null;
  industry: string | null;
  foundedYear: number | null;
  employeeCount: number | null;
  defaultResponseWindowDays: number | null;
  defaultOfferWindowDays: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCompanyData {
  legalName: string;
  displayName: string;
  slug: string;
  companyType: NewCompany['companyType'];
  website?: string;
  logoUrl?: string;
  bannerUrl?: string;
  description?: string;
  industry?: string;
  foundedYear?: number;
  employeeCount?: number;
}

export type UpdateCompanyData = Partial<Omit<CreateCompanyData, 'slug'>> & {
  defaultResponseWindowDays?: number;
  defaultOfferWindowDays?: number;
};

const companySelection = {
  id: companies.id,
  legalName: companies.legalName,
  displayName: companies.displayName,
  slug: companies.slug,
  companyType: companies.companyType,
  website: companies.website,
  logoUrl: companies.logoUrl,
  bannerUrl: companies.bannerUrl,
  verified: companies.verified,
  verificationStatus: companies.verificationStatus,
  description: companyProfiles.description,
  industry: companyProfiles.industry,
  foundedYear: companyProfiles.foundedYear,
  employeeCount: companyProfiles.employeeCount,
  defaultResponseWindowDays: companies.defaultResponseWindowDays,
  defaultOfferWindowDays: companies.defaultOfferWindowDays,
  createdAt: companies.createdAt,
  updatedAt: companies.updatedAt,
};

export class CompanyRepository {
  async slugExists(slug: string): Promise<boolean> {
    const [row] = await db
      .select({ id: companies.id })
      .from(companies)
      .where(eq(companies.slug, slug))
      .limit(1);

    return Boolean(row);
  }

  async createWithProfileAndAdmin(data: CreateCompanyData, userId: string): Promise<CompanyRecord> {
    return db.transaction(async (tx) => {
      const [company] = await tx
        .insert(companies)
        .values({
          legalName: data.legalName,
          displayName: data.displayName,
          slug: data.slug,
          companyType: data.companyType,
          website: data.website,
          logoUrl: data.logoUrl,
          bannerUrl: data.bannerUrl,
        })
        .returning();

      if (!company) {
        throw new Error('Failed to create company');
      }

      const [profile] = await tx
        .insert(companyProfiles)
        .values({
          companyId: company.id,
          description: data.description,
          industry: data.industry,
          foundedYear: data.foundedYear,
          employeeCount: data.employeeCount,
        })
        .returning();

      if (!profile) {
        throw new Error('Failed to create company profile');
      }

      await tx.insert(companyAdmins).values({
        companyId: company.id,
        userId,
      });

      return {
        ...company,
        description: profile.description,
        industry: profile.industry,
        foundedYear: profile.foundedYear,
        employeeCount: profile.employeeCount,
      };
    });
  }

  async findById(id: string): Promise<CompanyRecord | undefined> {
    const [company] = await db
      .select(companySelection)
      .from(companies)
      .leftJoin(companyProfiles, eq(companyProfiles.companyId, companies.id))
      .where(eq(companies.id, id))
      .limit(1);

    return company;
  }

  async findByIds(ids: string[]): Promise<CompanyRecord[]> {
    if (ids.length === 0) {
      return [];
    }

    return db
      .select(companySelection)
      .from(companies)
      .leftJoin(companyProfiles, eq(companyProfiles.companyId, companies.id))
      .where(inArray(companies.id, ids));
  }

  async list(limit: number, offset: number, q?: string): Promise<CompanyRecord[]> {
    const nameMatch = q
      ? or(ilike(companies.legalName, `%${q}%`), ilike(companies.displayName, `%${q}%`))
      : undefined;

    return db
      .select(companySelection)
      .from(companies)
      .leftJoin(companyProfiles, eq(companyProfiles.companyId, companies.id))
      .where(nameMatch)
      .orderBy(companies.createdAt)
      .limit(limit)
      .offset(offset);
  }

  async listForAdmin(userId: string): Promise<CompanyRecord[]> {
    return db
      .select(companySelection)
      .from(companyAdmins)
      .innerJoin(companies, eq(companies.id, companyAdmins.companyId))
      .leftJoin(companyProfiles, eq(companyProfiles.companyId, companies.id))
      .where(eq(companyAdmins.userId, userId))
      .orderBy(companies.createdAt);
  }

  async isAdmin(companyId: string, userId: string): Promise<boolean> {
    const [row] = await db
      .select({ companyId: companyAdmins.companyId })
      .from(companyAdmins)
      .where(and(eq(companyAdmins.companyId, companyId), eq(companyAdmins.userId, userId)))
      .limit(1);

    return Boolean(row);
  }

  // companies.verified and companies.verificationStatus are a redundant pair
  // with company_verifications.verificationStatus (pre-existing schema
  // design, not something to fix here) -- kept in sync so the public-facing
  // fields never contradict each other (verified=true but status=PENDING).
  async setVerificationStatus(id: string, status: 'VERIFIED' | 'REJECTED'): Promise<void> {
    await db
      .update(companies)
      .set({ verified: status === 'VERIFIED', verificationStatus: status, updatedAt: new Date() })
      .where(eq(companies.id, id));
  }

  async updateById(id: string, data: UpdateCompanyData): Promise<CompanyRecord | undefined> {
    return db.transaction(async (tx) => {
      const companyUpdates: Partial<NewCompany> = {};

      if (data.legalName !== undefined) companyUpdates.legalName = data.legalName;
      if (data.displayName !== undefined) companyUpdates.displayName = data.displayName;
      if (data.companyType !== undefined) companyUpdates.companyType = data.companyType;
      if (data.website !== undefined) companyUpdates.website = data.website;
      if (data.logoUrl !== undefined) companyUpdates.logoUrl = data.logoUrl;
      if (data.bannerUrl !== undefined) companyUpdates.bannerUrl = data.bannerUrl;
      if (data.defaultResponseWindowDays !== undefined) {
        companyUpdates.defaultResponseWindowDays = data.defaultResponseWindowDays;
      }
      if (data.defaultOfferWindowDays !== undefined) {
        companyUpdates.defaultOfferWindowDays = data.defaultOfferWindowDays;
      }

      if (Object.keys(companyUpdates).length > 0) {
        await tx
          .update(companies)
          .set({ ...companyUpdates, updatedAt: new Date() })
          .where(eq(companies.id, id));
      }

      const profileUpdates: Partial<NewCompanyProfile> = {};

      if (data.description !== undefined) profileUpdates.description = data.description;
      if (data.industry !== undefined) profileUpdates.industry = data.industry;
      if (data.foundedYear !== undefined) profileUpdates.foundedYear = data.foundedYear;
      if (data.employeeCount !== undefined) profileUpdates.employeeCount = data.employeeCount;

      if (Object.keys(profileUpdates).length > 0) {
        await tx
          .update(companyProfiles)
          .set({ ...profileUpdates, updatedAt: new Date() })
          .where(eq(companyProfiles.companyId, id));
      }

      const [company] = await tx
        .select(companySelection)
        .from(companies)
        .leftJoin(companyProfiles, eq(companyProfiles.companyId, companies.id))
        .where(eq(companies.id, id))
        .limit(1);

      return company;
    });
  }
}
