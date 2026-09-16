import { Injectable, NotFoundException } from '@nestjs/common';

import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateModerationCaseDto } from './dto/create-moderation-case.dto';
import { ListModerationCasesDto } from './dto/list-moderation-cases.dto';
import { UpdateCaseStatusDto } from './dto/update-case-status.dto';
import { ModerationCaseRecord, ModerationCaseRepository } from './moderation-case.repository';

@Injectable()
export class ModerationCaseService {
  constructor(
    private readonly caseRepository: ModerationCaseRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  async createCase(userId: string, dto: CreateModerationCaseDto): Promise<ModerationCaseRecord> {
    const created = await this.caseRepository.create(userId, {
      targetType: dto.targetType,
      targetId: dto.targetId,
      reason: dto.reason,
      description: dto.description,
    });

    await this.auditLogService.record({
      actorId: userId,
      entityType: dto.targetType,
      entityId: dto.targetId,
      action: `${dto.targetType}_REPORTED`,
      metadata: { moderationCaseId: created.id, reason: dto.reason },
    });

    return created;
  }

  async listCases(query: ListModerationCasesDto): Promise<ModerationCaseRecord[]> {
    return this.caseRepository.list({
      limit: query.limit ?? 20,
      offset: query.offset ?? 0,
      status: query.status,
    });
  }

  async getCase(caseId: string): Promise<ModerationCaseRecord> {
    const moderationCase = await this.caseRepository.findById(caseId);

    if (!moderationCase) {
      throw new NotFoundException('Moderation case not found');
    }

    return moderationCase;
  }

  async updateStatus(
    caseId: string,
    userId: string,
    dto: UpdateCaseStatusDto,
  ): Promise<ModerationCaseRecord> {
    const existing = await this.getCase(caseId);

    const updated = await this.caseRepository.updateStatus(caseId, dto.status);

    if (!updated) {
      throw new NotFoundException('Moderation case not found');
    }

    await this.auditLogService.record({
      actorId: userId,
      entityType: 'MODERATION_CASE',
      entityId: caseId,
      action: 'STATUS_CHANGED',
      metadata: { from: existing.status, to: dto.status },
    });

    return updated;
  }
}
