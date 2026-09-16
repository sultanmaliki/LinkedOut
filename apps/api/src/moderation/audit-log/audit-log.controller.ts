import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { AuthGuard } from '../../auth/guards/auth.guard';
import { ModeratorGuard } from '../moderator.guard';
import { AuditLogService } from './audit-log.service';
import { ListAuditLogsDto } from './dto/list-audit-logs.dto';

@Controller('moderation/audit-logs')
@UseGuards(AuthGuard, ModeratorGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  async listAll(@Query() query: ListAuditLogsDto) {
    const limit = query.limit ?? 20;
    const offset = query.offset ?? 0;

    if (query.entityType && query.entityId) {
      return this.auditLogService.listForEntity(query.entityType, query.entityId, limit, offset);
    }

    return this.auditLogService.listAll(limit, offset);
  }
}
