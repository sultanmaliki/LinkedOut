import { Injectable, NotFoundException } from '@nestjs/common';

import { AuditLogService } from '../audit-log/audit-log.service';
import { ModerationCaseRepository } from '../cases/moderation-case.repository';
import { CreateModerationActionDto } from './dto/create-moderation-action.dto';
import { ModerationActionRecord, ModerationActionRepository } from './moderation-action.repository';

@Injectable()
export class ModerationActionService {
  constructor(
    private readonly actionRepository: ModerationActionRepository,
    private readonly caseRepository: ModerationCaseRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  async createAction(
    caseId: string,
    moderatorId: string,
    dto: CreateModerationActionDto,
  ): Promise<ModerationActionRecord> {
    const moderationCase = await this.caseRepository.findById(caseId);

    if (!moderationCase) {
      throw new NotFoundException('Moderation case not found');
    }

    const action = await this.actionRepository.create(caseId, moderatorId, dto.action, dto.notes);

    await this.caseRepository.updateStatus(caseId, 'ACTION_TAKEN');

    await this.auditLogService.record({
      actorId: moderatorId,
      entityType: moderationCase.targetType,
      entityId: moderationCase.targetId,
      action: dto.action,
      metadata: { moderationCaseId: caseId, notes: dto.notes },
    });

    return action;
  }

  async listByCase(caseId: string): Promise<ModerationActionRecord[]> {
    const moderationCase = await this.caseRepository.findById(caseId);

    if (!moderationCase) {
      throw new NotFoundException('Moderation case not found');
    }

    return this.actionRepository.listByCase(caseId);
  }
}
