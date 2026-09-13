import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../../auth/guards/auth.guard';
import { ModeratorGuard } from '../moderator.guard';
import { AuditLogService } from './audit-log.service';

@Controller('moderation/audit-logs')
@UseGuards(AuthGuard, ModeratorGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async listAll(@Query('entityType') entityType?: string, @Query('entityId') entityId?: string) {
    if (entityType && entityId) {
      return this.auditLogService.listForEntity(entityType, entityId);
    }

    return this.auditLogService.listAll();
  }
}
