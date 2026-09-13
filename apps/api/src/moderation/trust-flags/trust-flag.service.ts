import { Injectable } from '@nestjs/common';

import { CreateTrustFlagDto } from './dto/create-trust-flag.dto';
import { TrustFlagRecord, TrustFlagRepository } from './trust-flag.repository';

@Injectable()
export class TrustFlagService {
  constructor(private readonly trustFlagRepository: TrustFlagRepository) {}

  async createFlag(dto: CreateTrustFlagDto): Promise<TrustFlagRecord> {
    return this.trustFlagRepository.create(
      dto.userId,
      dto.targetType,
      dto.targetId,
      dto.reason,
      dto.scoreImpact,
    );
  }

  async listForUser(userId: string): Promise<TrustFlagRecord[]> {
    return this.trustFlagRepository.listByUser(userId);
  }
}
