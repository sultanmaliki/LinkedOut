import { Injectable, NotFoundException } from '@nestjs/common';

import { ProfessionalProfileRepository } from '../professional-profile.repository';
import { SetProfessionalSkillsDto } from './dto/set-professional-skills.dto';
import { ProfessionalSkillRecord, SkillRepository } from './skill.repository';

@Injectable()
export class SkillService {
  constructor(
    private readonly skillRepository: SkillRepository,
    private readonly profileRepository: ProfessionalProfileRepository,
  ) {}

  async listMySkills(userId: string): Promise<ProfessionalSkillRecord[]> {
    const profileId = await this.requireProfileId(userId);

    return this.skillRepository.listForProfile(profileId);
  }

  async listForProfileId(profileId: string): Promise<ProfessionalSkillRecord[]> {
    return this.skillRepository.listForProfile(profileId);
  }

  async setMySkills(
    userId: string,
    dto: SetProfessionalSkillsDto,
  ): Promise<ProfessionalSkillRecord[]> {
    const profileId = await this.requireProfileId(userId);

    return this.skillRepository.replaceForProfile(profileId, dto.skills);
  }

  private async requireProfileId(userId: string): Promise<string> {
    const profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException('Professional profile not found');
    }

    return profile.id;
  }
}
