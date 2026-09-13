import { Module } from '@nestjs/common';

import { AuditLogController } from './audit-log/audit-log.controller';
import { AuditLogRepository } from './audit-log/audit-log.repository';
import { AuditLogService } from './audit-log/audit-log.service';
import { ModerationActionController } from './actions/moderation-action.controller';
import { ModerationActionRepository } from './actions/moderation-action.repository';
import { ModerationActionService } from './actions/moderation-action.service';
import { ModerationCaseController } from './cases/moderation-case.controller';
import { ModerationCaseRepository } from './cases/moderation-case.repository';
import { ModerationCaseService } from './cases/moderation-case.service';
import { TrustFlagController } from './trust-flags/trust-flag.controller';
import { TrustFlagRepository } from './trust-flags/trust-flag.repository';
import { TrustFlagService } from './trust-flags/trust-flag.service';

@Module({
  controllers: [
    ModerationCaseController,
    ModerationActionController,
    TrustFlagController,
    AuditLogController,
  ],
  providers: [
    ModerationCaseRepository,
    ModerationCaseService,
    ModerationActionRepository,
    ModerationActionService,
    TrustFlagRepository,
    TrustFlagService,
    AuditLogRepository,
    AuditLogService,
  ],
})
export class ModerationModule {}
