import { Injectable, NotFoundException } from '@nestjs/common';

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
