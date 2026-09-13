import { TrustFlagService } from '../trust-flag.service';

describe('TrustFlagService', () => {
  const trustFlagRepository = {
    create: jest.fn(),
    listByUser: jest.fn(),
  };

  const service = new TrustFlagService(trustFlagRepository as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a trust flag', async () => {
    const dto = {
      userId: 'user-1',
      targetType: 'REVIEW',
      targetId: 'review-1',
      reason: 'Repeated fake reviews',
      scoreImpact: -10,
    };
    const created = { id: 'flag-1', ...dto };
    trustFlagRepository.create.mockResolvedValue(created);

    await expect(service.createFlag(dto)).resolves.toEqual(created);
    expect(trustFlagRepository.create).toHaveBeenCalledWith(
      'user-1',
      'REVIEW',
      'review-1',
      'Repeated fake reviews',
      -10,
    );
  });

  it('lists flags for a user', async () => {
    const flags = [{ id: 'flag-1' }];
    trustFlagRepository.listByUser.mockResolvedValue(flags);

    await expect(service.listForUser('user-1')).resolves.toEqual(flags);
  });
});
