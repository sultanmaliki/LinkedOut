import { NotFoundException } from '@nestjs/common';

import { EmploymentVerificationService } from '../employment-verification.service';

describe('EmploymentVerificationService', () => {
  const verificationRepository = {
    findByHistoryId: jest.fn(),
    upsert: jest.fn(),
  };

  const historyRepository = {
    findById: jest.fn(),
  };

  const profileRepository = {
    findByUserId: jest.fn(),
  };

  const service = new EmploymentVerificationService(
    verificationRepository as never,
    historyRepository as never,
    profileRepository as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns the verification record for an owned history entry', async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
    historyRepository.findById.mockResolvedValue({ id: 'history-1' });

    const verification = { employmentHistoryId: 'history-1', verificationStatus: 'PENDING' };
    verificationRepository.findByHistoryId.mockResolvedValue(verification);

    await expect(service.getVerification('user-1', 'history-1')).resolves.toEqual(verification);
  });

  it('throws when the employment history does not belong to the user', async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
    historyRepository.findById.mockResolvedValue(undefined);

    await expect(service.getVerification('user-1', 'history-1')).rejects.toThrow(
      new NotFoundException('Employment history not found'),
    );
  });

  it('throws when no verification has been submitted yet', async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
    historyRepository.findById.mockResolvedValue({ id: 'history-1' });
    verificationRepository.findByHistoryId.mockResolvedValue(undefined);

    await expect(service.getVerification('user-1', 'history-1')).rejects.toThrow(
      new NotFoundException('Employment verification not found'),
    );
  });

  it('submits verification details for an owned history entry', async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
    historyRepository.findById.mockResolvedValue({ id: 'history-1' });

    const dto = { companyEmail: 'ada@acme.com' };
    const result = { employmentHistoryId: 'history-1', ...dto, verificationStatus: 'PENDING' };
    verificationRepository.upsert.mockResolvedValue(result);

    await expect(service.submitVerification('user-1', 'history-1', dto)).resolves.toEqual(result);
    expect(verificationRepository.upsert).toHaveBeenCalledWith('history-1', dto);
  });
});
