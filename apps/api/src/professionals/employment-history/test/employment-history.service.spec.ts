import { NotFoundException } from '@nestjs/common';

import { EmploymentHistoryService } from '../employment-history.service';

describe('EmploymentHistoryService', () => {
  const historyRepository = {
    create: jest.fn(),
    listByProfile: jest.fn(),
    findById: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
  };

  const profileRepository = {
    findByUserId: jest.fn(),
  };

  const service = new EmploymentHistoryService(
    historyRepository as never,
    profileRepository as never,
  );

  const dto = {
    companyName: 'Acme Corp',
    jobTitle: 'Software Engineer',
    employmentType: 'FULL_TIME' as const,
    workMode: 'REMOTE' as const,
    startDate: '2022-01-01',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists history for the authenticated user', async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
    const history = [{ id: 'history-1' }];
    historyRepository.listByProfile.mockResolvedValue(history);

    await expect(service.listMyHistory('user-1')).resolves.toEqual(history);
  });

  it('throws when the professional profile does not exist', async () => {
    profileRepository.findByUserId.mockResolvedValue(undefined);

    await expect(service.listMyHistory('missing')).rejects.toThrow(
      new NotFoundException('Professional profile not found'),
    );
  });

  it('creates history for the authenticated user', async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
    const created = { id: 'history-1', ...dto };
    historyRepository.create.mockResolvedValue(created);

    await expect(service.createHistory('user-1', dto)).resolves.toEqual(created);
    expect(historyRepository.create).toHaveBeenCalledWith('profile-1', dto);
  });

  it('updates history that exists', async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
    historyRepository.findById.mockResolvedValue({ id: 'history-1' });

    const updated = { id: 'history-1', jobTitle: 'Staff Engineer' };
    historyRepository.updateById.mockResolvedValue(updated);

    await expect(
      service.updateHistory('user-1', 'history-1', { jobTitle: 'Staff Engineer' }),
    ).resolves.toEqual(updated);
  });

  it('throws when updating history that does not exist', async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
    historyRepository.findById.mockResolvedValue(undefined);

    await expect(
      service.updateHistory('user-1', 'missing', { jobTitle: 'Staff Engineer' }),
    ).rejects.toThrow(new NotFoundException('Employment history not found'));

    expect(historyRepository.updateById).not.toHaveBeenCalled();
  });

  it('deletes history that exists', async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
    historyRepository.deleteById.mockResolvedValue(true);

    await expect(service.deleteHistory('user-1', 'history-1')).resolves.toBeUndefined();
  });

  it('throws when deleting history that does not exist', async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
    historyRepository.deleteById.mockResolvedValue(false);

    await expect(service.deleteHistory('user-1', 'missing')).rejects.toThrow(
      new NotFoundException('Employment history not found'),
    );
  });
});
