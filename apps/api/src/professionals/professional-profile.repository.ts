import { and, eq, ilike, inArray, or } from 'drizzle-orm';

import {
  db,
  employmentExpectations,
  professionalProfiles,
  professionalSkills,
  skills,
} from '@linkedout/database';

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

export interface SearchProfessionalProfilesFilters {
  limit: number;
  offset: number;
  q?: string;
  headline?: string;
  location?: string;
  skill?: string;
  activelyLooking?: boolean;
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
  async findById(id: string): Promise<ProfessionalProfileRecord | undefined> {
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
      .where(eq(professionalProfiles.id, id))
      .limit(1);

    return profile;
  }

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

  async search(filters: SearchProfessionalProfilesFilters): Promise<ProfessionalProfileRecord[]> {
    const conditions = [];

    if (filters.q) {
      conditions.push(
        or(
          ilike(professionalProfiles.fullName, `%${filters.q}%`),
          ilike(professionalProfiles.headline, `%${filters.q}%`),
        ),
      );
    }

    if (filters.headline) {
      conditions.push(ilike(professionalProfiles.headline, `%${filters.headline}%`));
    }

    if (filters.location) {
      conditions.push(ilike(professionalProfiles.currentLocation, `%${filters.location}%`));
    }

    if (filters.skill) {
      const matches = await db
        .select({ profileId: professionalSkills.professionalProfileId })
        .from(professionalSkills)
        .innerJoin(skills, eq(skills.id, professionalSkills.skillId))
        .where(ilike(skills.name, `%${filters.skill}%`));

      const profileIds = [...new Set(matches.map((match) => match.profileId))];

      if (profileIds.length === 0) {
        return [];
      }

      conditions.push(inArray(professionalProfiles.id, profileIds));
    }

    if (filters.activelyLooking) {
      const matches = await db
        .select({ profileId: employmentExpectations.professionalProfileId })
        .from(employmentExpectations)
        .where(eq(employmentExpectations.activelyLooking, true));

      const profileIds = [...new Set(matches.map((match) => match.profileId))];

      if (profileIds.length === 0) {
        return [];
      }

      conditions.push(inArray(professionalProfiles.id, profileIds));
    }

    return db
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
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(professionalProfiles.createdAt)
      .limit(filters.limit)
      .offset(filters.offset);
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
