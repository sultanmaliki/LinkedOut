import { NotFoundException } from '@nestjs/common';

import { EmploymentExpectationService } from '../employment-expectation.service';

describe('EmploymentExpectationService', () => {
  const expectationRepository = {
    findByProfile: jest.fn(),
    upsert: jest.fn(),
  };

  const profileRepository = {
    findByUserId: jest.fn(),
  };

  const service = new EmploymentExpectationService(
    expectationRepository as never,
    profileRepository as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const dto = {
    desiredJobTitle: 'Senior Engineer',
    employmentType: 'FULL_TIME' as const,
    workMode: 'REMOTE' as const,
  };

  it('returns the expectation for the authenticated user', async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });

    const expectation = { professionalProfileId: 'profile-1', ...dto };
    expectationRepository.findByProfile.mockResolvedValue(expectation);

    await expect(service.getMyExpectation('user-1')).resolves.toEqual(expectation);
  });

  it('throws when no expectation has been set', async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
    expectationRepository.findByProfile.mockResolvedValue(undefined);

    await expect(service.getMyExpectation('user-1')).rejects.toThrow(
      new NotFoundException('Employment expectation not set'),
    );
  });

  it('throws when the professional profile does not exist', async () => {
    profileRepository.findByUserId.mockResolvedValue(undefined);

    await expect(service.getMyExpectation('missing')).rejects.toThrow(
      new NotFoundException('Professional profile not found'),
    );
  });

  it('upserts the expectation for the authenticated user', async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });

    const result = { professionalProfileId: 'profile-1', ...dto };
    expectationRepository.upsert.mockResolvedValue(result);

    await expect(service.setMyExpectation('user-1', dto)).resolves.toEqual(result);
    expect(expectationRepository.upsert).toHaveBeenCalledWith('profile-1', dto);
  });
});
