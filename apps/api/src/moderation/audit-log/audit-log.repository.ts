import { and, desc, eq } from 'drizzle-orm';

import { auditLogs, db } from '@linkedout/database';

export type AuditLogRecord = typeof auditLogs.$inferSelect;

export interface RecordAuditLogData {
  actorId?: string | null;
  entityType: string;
  entityId: string;
  action: string;
  metadata?: Record<string, unknown>;
}

export class AuditLogRepository {
  async create(data: RecordAuditLogData): Promise<AuditLogRecord> {
    const [log] = await db
      .insert(auditLogs)
      .values({
        actorId: data.actorId ?? null,
        entityType: data.entityType,
        entityId: data.entityId,
        action: data.action,
        metadata: data.metadata,
      })
      .returning();

    if (!log) {
      throw new Error('Failed to create audit log entry');
    }

    return log;
  }

  async listByEntity(
    entityType: string,
    entityId: string,
    limit: number,
    offset: number,
  ): Promise<AuditLogRecord[]> {
    return db
      .select()
      .from(auditLogs)
      .where(and(eq(auditLogs.entityType, entityType), eq(auditLogs.entityId, entityId)))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async list(limit: number, offset: number): Promise<AuditLogRecord[]> {
    return db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);
  }
}
