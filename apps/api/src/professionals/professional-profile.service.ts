import { Injectable, NotFoundException } from '@nestjs/common';

import { ListProfessionalsDto } from './dto/list-professionals.dto';
import { UpdateProfessionalProfileDto } from './dto/update-professional-profile.dto';
import {
  ProfessionalProfileRecord,
  ProfessionalProfileRepository,
} from './professional-profile.repository';

@Injectable()
export class ProfessionalProfileService {
  constructor(private readonly profileRepository: ProfessionalProfileRepository) {}

  async getMyProfile(userId: string): Promise<ProfessionalProfileRecord> {
    const profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException('Professional profile not found');
    }

    return profile;
  }

  async searchProfiles(query: ListProfessionalsDto): Promise<ProfessionalProfileRecord[]> {
    return this.profileRepository.search({
      limit: query.limit ?? 20,
      offset: query.offset ?? 0,
      headline: query.headline,
      location: query.location,
      skill: query.skill,
      activelyLooking: query.activelyLooking,
    });
  }

  async getProfile(id: string): Promise<ProfessionalProfileRecord> {
    const profile = await this.profileRepository.findById(id);

    if (!profile) {
      throw new NotFoundException('Professional profile not found');
    }

    return profile;
  }

  async updateMyProfile(
    userId: string,
    dto: UpdateProfessionalProfileDto,
  ): Promise<ProfessionalProfileRecord> {
    const existing = await this.profileRepository.findByUserId(userId);

    if (!existing) {
      throw new NotFoundException('Professional profile not found');
    }

    const updated = await this.profileRepository.updateByUserId(userId, dto);

    if (!updated) {
      throw new NotFoundException('Professional profile not found');
    }

    return updated;
  }
}
