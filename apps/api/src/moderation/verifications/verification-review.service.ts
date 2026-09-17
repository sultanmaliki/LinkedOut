import { ConflictException, Injectable } from '@nestjs/common';

import { CompanyRepository } from '../../companies/company.repository';
import {
  CompanyVerificationRecord,
  CompanyVerificationRepository,
  PendingCompanyVerification,
} from '../../companies/verification/company-verification.repository';
import {
  EmploymentVerificationRecord,
  EmploymentVerificationRepository,
  PendingEmploymentVerification,
} from '../../professionals/employment-verification/employment-verification.repository';
import { AuditLogService } from '../audit-log/audit-log.service';
import { ReviewVerificationDto } from './dto/review-verification.dto';

@Injectable()
export class VerificationReviewService {
  constructor(
    private readonly companyVerificationRepository: CompanyVerificationRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly employmentVerificationRepository: EmploymentVerificationRepository,
    private readonly auditLogService: AuditLogService,
  ) {}

  async listPendingCompanies(): Promise<PendingCompanyVerification[]> {
    return this.companyVerificationRepository.listPending();
  }

  async reviewCompany(
    id: string,
    moderatorId: string,
    dto: ReviewVerificationDto,
  ): Promise<CompanyVerificationRecord> {
    const updated = await this.companyVerificationRepository.review(id, {
      verificationStatus: dto.status,
      rejectionReason: dto.rejectionReason,
    });

    if (!updated) {
      throw new ConflictException(
        'Verification not found or already reviewed (it may have been resubmitted or decided already)',
      );
    }

    // The only place companies.verified/verificationStatus (the public
    // fields) are ever set -- approving here is what makes it possible at all.
    await this.companyRepository.setVerificationStatus(updated.companyId, dto.status);

    await this.auditLogService.record({
      actorId: moderatorId,
      entityType: 'COMPANY_VERIFICATION',
      entityId: id,
      action: dto.status === 'VERIFIED' ? 'VERIFICATION_APPROVED' : 'VERIFICATION_REJECTED',
      metadata: { companyId: updated.companyId, rejectionReason: dto.rejectionReason },
    });

    return updated;
  }

  async listPendingProfessionals(): Promise<PendingEmploymentVerification[]> {
    return this.employmentVerificationRepository.listPending();
  }

  async reviewProfessional(
    id: string,
    moderatorId: string,
    dto: ReviewVerificationDto,
  ): Promise<EmploymentVerificationRecord> {
    const updated = await this.employmentVerificationRepository.review(id, {
      verificationStatus: dto.status,
      rejectionReason: dto.rejectionReason,
    });

    if (!updated) {
      throw new ConflictException(
        'Verification not found or already reviewed (it may have been resubmitted or decided already)',
      );
    }

    await this.auditLogService.record({
      actorId: moderatorId,
      entityType: 'EMPLOYMENT_VERIFICATION',
      entityId: id,
      action: dto.status === 'VERIFIED' ? 'VERIFICATION_APPROVED' : 'VERIFICATION_REJECTED',
      metadata: {
        employmentHistoryId: updated.employmentHistoryId,
        rejectionReason: dto.rejectionReason,
      },
    });

    return updated;
  }
}
