import { Injectable, NotFoundException } from '@nestjs/common';

import { ProfessionalProfileRepository } from '../professional-profile.repository';
import { CreateEmploymentHistoryDto } from './dto/create-employment-history.dto';
import { UpdateEmploymentHistoryDto } from './dto/update-employment-history.dto';
import {
  EmploymentHistoryRecord,
  EmploymentHistoryRepository,
} from './employment-history.repository';

@Injectable()
export class EmploymentHistoryService {
  constructor(
    private readonly historyRepository: EmploymentHistoryRepository,
    private readonly profileRepository: ProfessionalProfileRepository,
  ) {}

  async listMyHistory(userId: string): Promise<EmploymentHistoryRecord[]> {
    const profileId = await this.requireProfileId(userId);

    return this.historyRepository.listByProfile(profileId);
  }

  async createHistory(
    userId: string,
    dto: CreateEmploymentHistoryDto,
  ): Promise<EmploymentHistoryRecord> {
    const profileId = await this.requireProfileId(userId);

    return this.historyRepository.create(profileId, dto);
  }

  async updateHistory(
    userId: string,
    historyId: string,
    dto: UpdateEmploymentHistoryDto,
  ): Promise<EmploymentHistoryRecord> {
    const profileId = await this.requireProfileId(userId);

    const existing = await this.historyRepository.findById(profileId, historyId);

    if (!existing) {
      throw new NotFoundException('Employment history not found');
    }

    const updated = await this.historyRepository.updateById(profileId, historyId, dto);

    if (!updated) {
      throw new NotFoundException('Employment history not found');
    }

    return updated;
  }

  async deleteHistory(userId: string, historyId: string): Promise<void> {
    const profileId = await this.requireProfileId(userId);

    const deleted = await this.historyRepository.deleteById(profileId, historyId);

    if (!deleted) {
      throw new NotFoundException('Employment history not found');
    }
  }

  private async requireProfileId(userId: string): Promise<string> {
    const profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException('Professional profile not found');
    }

    return profile.id;
  }
}
