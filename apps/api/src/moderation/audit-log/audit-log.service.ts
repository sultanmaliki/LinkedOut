import { Injectable } from '@nestjs/common';

import { AuditLogRecord, AuditLogRepository, RecordAuditLogData } from './audit-log.repository';

@Injectable()
export class AuditLogService {
  constructor(private readonly auditLogRepository: AuditLogRepository) {}

  async record(data: RecordAuditLogData): Promise<void> {
    await this.auditLogRepository.create(data);
  }

  async listAll(limit = 20, offset = 0): Promise<AuditLogRecord[]> {
    return this.auditLogRepository.list(limit, offset);
  }

  async listForEntity(
    entityType: string,
    entityId: string,
    limit = 20,
    offset = 0,
  ): Promise<AuditLogRecord[]> {
    return this.auditLogRepository.listByEntity(entityType, entityId, limit, offset);
  }
}
