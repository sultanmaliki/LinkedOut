import { Injectable, NotFoundException } from '@nestjs/common';

import { EmploymentHistoryRepository } from '../employment-history/employment-history.repository';
import { ProfessionalProfileRepository } from '../professional-profile.repository';
import { SubmitEmploymentVerificationDto } from './dto/submit-employment-verification.dto';
import {
  EmploymentVerificationRecord,
  EmploymentVerificationRepository,
} from './employment-verification.repository';

@Injectable()
export class EmploymentVerificationService {
  constructor(
    private readonly verificationRepository: EmploymentVerificationRepository,
    private readonly historyRepository: EmploymentHistoryRepository,
    private readonly profileRepository: ProfessionalProfileRepository,
  ) {}

  async getVerification(userId: string, historyId: string): Promise<EmploymentVerificationRecord> {
    await this.requireOwnedHistory(userId, historyId);

    const verification = await this.verificationRepository.findByHistoryId(historyId);

    if (!verification) {
      throw new NotFoundException('Employment verification not found');
    }

    return verification;
  }

  async submitVerification(
    userId: string,
    historyId: string,
    dto: SubmitEmploymentVerificationDto,
  ): Promise<EmploymentVerificationRecord> {
    await this.requireOwnedHistory(userId, historyId);

    return this.verificationRepository.upsert(historyId, dto);
  }

  private async requireOwnedHistory(userId: string, historyId: string): Promise<void> {
    const profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException('Professional profile not found');
    }

    const history = await this.historyRepository.findById(profile.id, historyId);

    if (!history) {
      throw new NotFoundException('Employment history not found');
    }
  }
}
