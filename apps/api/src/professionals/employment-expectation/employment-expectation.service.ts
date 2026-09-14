import { Injectable, NotFoundException } from '@nestjs/common';

import { ProfessionalProfileRepository } from '../professional-profile.repository';
import { SetEmploymentExpectationDto } from './dto/set-employment-expectation.dto';
import {
  EmploymentExpectationRecord,
  EmploymentExpectationRepository,
} from './employment-expectation.repository';

@Injectable()
export class EmploymentExpectationService {
  constructor(
    private readonly expectationRepository: EmploymentExpectationRepository,
    private readonly profileRepository: ProfessionalProfileRepository,
  ) {}

  async getMyExpectation(userId: string): Promise<EmploymentExpectationRecord> {
    const profileId = await this.requireProfileId(userId);

    const expectation = await this.expectationRepository.findByProfile(profileId);

    if (!expectation) {
      throw new NotFoundException('Employment expectation not set');
    }

    return expectation;
  }

  async getForProfileId(profileId: string): Promise<EmploymentExpectationRecord | null> {
    const expectation = await this.expectationRepository.findByProfile(profileId);

    return expectation ?? null;
  }

  async setMyExpectation(
    userId: string,
    dto: SetEmploymentExpectationDto,
  ): Promise<EmploymentExpectationRecord> {
    const profileId = await this.requireProfileId(userId);

    return this.expectationRepository.upsert(profileId, dto);
  }

  private async requireProfileId(userId: string): Promise<string> {
    const profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException('Professional profile not found');
    }

    return profile.id;
  }
}
