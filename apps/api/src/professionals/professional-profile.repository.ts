import { eq } from 'drizzle-orm';

import { db, professionalProfiles } from '@linkedout/database';

export interface ProfessionalProfileRecord {
  id: string;
  userId: string;
  fullName: string;
  headline: string | null;
  bio: string | null;
  profilePhotoUrl: string | null;
  bannerPhotoUrl: string | null;
  currentLocation: string | null;
  personalWebsite: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateProfessionalProfileData {
  fullName?: string;
  headline?: string;
  bio?: string;
  profilePhotoUrl?: string;
  bannerPhotoUrl?: string;
  currentLocation?: string;
  personalWebsite?: string;
}

export class ProfessionalProfileRepository {
  async findByUserId(userId: string): Promise<ProfessionalProfileRecord | undefined> {
    const [profile] = await db
      .select({
        id: professionalProfiles.id,
        userId: professionalProfiles.userId,
        fullName: professionalProfiles.fullName,
        headline: professionalProfiles.headline,
        bio: professionalProfiles.bio,
        profilePhotoUrl: professionalProfiles.profilePhotoUrl,
        bannerPhotoUrl: professionalProfiles.bannerPhotoUrl,
        currentLocation: professionalProfiles.currentLocation,
        personalWebsite: professionalProfiles.personalWebsite,
        createdAt: professionalProfiles.createdAt,
        updatedAt: professionalProfiles.updatedAt,
      })
      .from(professionalProfiles)
      .where(eq(professionalProfiles.userId, userId))
      .limit(1);

    return profile;
  }

  async updateByUserId(
    userId: string,
    data: UpdateProfessionalProfileData,
  ): Promise<ProfessionalProfileRecord | undefined> {
    const [profile] = await db
      .update(professionalProfiles)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(professionalProfiles.userId, userId))
      .returning({
        id: professionalProfiles.id,
        userId: professionalProfiles.userId,
        fullName: professionalProfiles.fullName,
        headline: professionalProfiles.headline,
        bio: professionalProfiles.bio,
        profilePhotoUrl: professionalProfiles.profilePhotoUrl,
        bannerPhotoUrl: professionalProfiles.bannerPhotoUrl,
        currentLocation: professionalProfiles.currentLocation,
        personalWebsite: professionalProfiles.personalWebsite,
        createdAt: professionalProfiles.createdAt,
        updatedAt: professionalProfiles.updatedAt,
      });

    return profile;
  }
}
