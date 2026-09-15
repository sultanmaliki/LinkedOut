import { ConflictException } from '@nestjs/common';

import { VerificationReviewService } from '../verification-review.service';

describe('VerificationReviewService', () => {
  const companyVerificationRepository = {
    listPending: jest.fn(),
    review: jest.fn(),
  };

  const companyRepository = {
    setVerificationStatus: jest.fn(),
  };

  const employmentVerificationRepository = {
    listPending: jest.fn(),
    review: jest.fn(),
  };

  const auditLogService = {
    record: jest.fn(),
  };

  const service = new VerificationReviewService(
    companyVerificationRepository as never,
    companyRepository as never,
    employmentVerificationRepository as never,
    auditLogService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('approves a company verification and marks the company verified', async () => {
    companyVerificationRepository.review.mockResolvedValue({
      id: 'ver-1',
      companyId: 'company-1',
      verificationStatus: 'VERIFIED',
    });

    await service.reviewCompany('ver-1', 'moderator-1', { status: 'VERIFIED' });

    expect(companyVerificationRepository.review).toHaveBeenCalledWith('ver-1', {
      verificationStatus: 'VERIFIED',
      rejectionReason: undefined,
    });
    expect(companyRepository.setVerificationStatus).toHaveBeenCalledWith('company-1', 'VERIFIED');
    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'moderator-1',
        entityType: 'COMPANY_VERIFICATION',
        entityId: 'ver-1',
        action: 'VERIFICATION_APPROVED',
      }),
    );
  });

  it('rejects a company verification without touching the public verified badge', async () => {
    companyVerificationRepository.review.mockResolvedValue({
      id: 'ver-1',
      companyId: 'company-1',
      verificationStatus: 'REJECTED',
    });

    await service.reviewCompany('ver-1', 'moderator-1', {
      status: 'REJECTED',
      rejectionReason: 'Document is illegible',
    });

    expect(companyRepository.setVerificationStatus).toHaveBeenCalledWith('company-1', 'REJECTED');
    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'VERIFICATION_REJECTED' }),
    );
  });

  it('throws when the company verification is already decided (or missing)', async () => {
    companyVerificationRepository.review.mockResolvedValue(undefined);

    await expect(
      service.reviewCompany('ver-1', 'moderator-1', { status: 'VERIFIED' }),
    ).rejects.toThrow(ConflictException);

    expect(companyRepository.setVerificationStatus).not.toHaveBeenCalled();
    expect(auditLogService.record).not.toHaveBeenCalled();
  });

  it('approves an employment verification', async () => {
    employmentVerificationRepository.review.mockResolvedValue({
      id: 'ever-1',
      employmentHistoryId: 'history-1',
      verificationStatus: 'VERIFIED',
    });

    await service.reviewProfessional('ever-1', 'moderator-1', { status: 'VERIFIED' });

    expect(employmentVerificationRepository.review).toHaveBeenCalledWith('ever-1', {
      verificationStatus: 'VERIFIED',
      rejectionReason: undefined,
    });
    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'EMPLOYMENT_VERIFICATION',
        entityId: 'ever-1',
        action: 'VERIFICATION_APPROVED',
      }),
    );
  });

  it('throws when the employment verification is already decided (or missing)', async () => {
    employmentVerificationRepository.review.mockResolvedValue(undefined);

    await expect(
      service.reviewProfessional('ever-1', 'moderator-1', {
        status: 'REJECTED',
        rejectionReason: 'x',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('lists pending company and employment verifications', async () => {
    const companies = [{ id: 'ver-1' }];
    const professionals = [{ id: 'ever-1' }];
    companyVerificationRepository.listPending.mockResolvedValue(companies);
    employmentVerificationRepository.listPending.mockResolvedValue(professionals);

    await expect(service.listPendingCompanies()).resolves.toEqual(companies);
    await expect(service.listPendingProfessionals()).resolves.toEqual(professionals);
  });
});
