import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { CompanyVerificationService } from '../company-verification.service';

describe('CompanyVerificationService', () => {
  const verificationRepository = {
    findByCompanyId: jest.fn(),
    upsert: jest.fn(),
  };

  const companyRepository = {
    findById: jest.fn(),
    isAdmin: jest.fn(),
  };

  const service = new CompanyVerificationService(
    verificationRepository as never,
    companyRepository as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the verification record for an admin', async () => {
    companyRepository.findById.mockResolvedValue({ id: 'company-1' });
    companyRepository.isAdmin.mockResolvedValue(true);

    const verification = { companyId: 'company-1', verificationStatus: 'PENDING' };
    verificationRepository.findByCompanyId.mockResolvedValue(verification);

    await expect(service.getVerification('company-1', 'user-1')).resolves.toEqual(verification);
  });

  it('throws when no verification has been submitted yet', async () => {
    companyRepository.findById.mockResolvedValue({ id: 'company-1' });
    companyRepository.isAdmin.mockResolvedValue(true);
    verificationRepository.findByCompanyId.mockResolvedValue(undefined);

    await expect(service.getVerification('company-1', 'user-1')).rejects.toThrow(
      new NotFoundException('Company verification not found'),
    );
  });

  it('throws when a non-admin requests the verification record', async () => {
    companyRepository.findById.mockResolvedValue({ id: 'company-1' });
    companyRepository.isAdmin.mockResolvedValue(false);

    await expect(service.getVerification('company-1', 'user-2')).rejects.toThrow(
      new ForbiddenException('You do not manage this company'),
    );
  });

  it('throws when the company does not exist', async () => {
    companyRepository.findById.mockResolvedValue(undefined);

    await expect(service.getVerification('missing', 'user-1')).rejects.toThrow(
      new NotFoundException('Company not found'),
    );
  });

  it('submits verification details for an admin', async () => {
    companyRepository.findById.mockResolvedValue({ id: 'company-1' });
    companyRepository.isAdmin.mockResolvedValue(true);

    const dto = { businessRegistrationNumber: 'REG-123' };
    const result = { companyId: 'company-1', ...dto, verificationStatus: 'PENDING' };
    verificationRepository.upsert.mockResolvedValue(result);

    await expect(service.submitVerification('company-1', 'user-1', dto)).resolves.toEqual(result);
    expect(verificationRepository.upsert).toHaveBeenCalledWith('company-1', dto);
  });

  it('throws when a non-admin submits verification details', async () => {
    companyRepository.findById.mockResolvedValue({ id: 'company-1' });
    companyRepository.isAdmin.mockResolvedValue(false);

    await expect(
      service.submitVerification('company-1', 'user-2', { businessRegistrationNumber: 'REG-123' }),
    ).rejects.toThrow(new ForbiddenException('You do not manage this company'));

    expect(verificationRepository.upsert).not.toHaveBeenCalled();
  });
});
