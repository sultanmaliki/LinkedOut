import { Test, TestingModule } from '@nestjs/testing';

import { TrustFlagController } from '../trust-flag.controller';
import { TrustFlagService } from '../trust-flag.service';

describe('TrustFlagController', () => {
  let controller: TrustFlagController;

  const trustFlagService = {
    createFlag: jest.fn(),
    listForUser: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrustFlagController],
      providers: [{ provide: TrustFlagService, useValue: trustFlagService }],
    }).compile();

    controller = module.get<TrustFlagController>(TrustFlagController);
  });

  it('creates a trust flag', async () => {
    const dto = {
      userId: 'user-1',
      targetType: 'REVIEW',
      targetId: 'review-1',
      reason: 'Repeated fake reviews',
    };
    const created = { id: 'flag-1', ...dto };
    trustFlagService.createFlag.mockResolvedValue(created);

    await expect(controller.createFlag(dto)).resolves.toEqual(created);
    expect(trustFlagService.createFlag).toHaveBeenCalledWith(dto);
  });

  it('lists flags for a user', async () => {
    const flags = [{ id: 'flag-1' }];
    trustFlagService.listForUser.mockResolvedValue(flags);

    await expect(controller.listForUser('user-1')).resolves.toEqual(flags);
  });
});
