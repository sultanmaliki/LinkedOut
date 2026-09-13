import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../../auth/guards/auth.guard';
import { ModerationCaseController } from '../moderation-case.controller';
import { ModerationCaseService } from '../moderation-case.service';

describe('ModerationCaseController', () => {
  let controller: ModerationCaseController;

  const caseService = {
    createCase: jest.fn(),
    listCases: jest.fn(),
    getCase: jest.fn(),
    updateStatus: jest.fn(),
  };

  const user: AuthenticatedUser = {
    id: 'user-1',
    email: 'ada@example.com',
    role: 'PROFESSIONAL',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModerationCaseController],
      providers: [{ provide: ModerationCaseService, useValue: caseService }],
    }).compile();

    controller = module.get<ModerationCaseController>(ModerationCaseController);
  });

  it('creates a case for the authenticated user', async () => {
    const dto = {
      targetType: 'REVIEW' as const,
      targetId: 'review-1',
      reason: 'FAKE_REVIEW' as const,
    };
    const created = { id: 'case-1', ...dto };
    caseService.createCase.mockResolvedValue(created);

    await expect(controller.createCase(user, dto)).resolves.toEqual(created);
    expect(caseService.createCase).toHaveBeenCalledWith('user-1', dto);
  });

  it('lists cases', async () => {
    const cases = [{ id: 'case-1' }];
    caseService.listCases.mockResolvedValue(cases);

    await expect(controller.listCases()).resolves.toEqual(cases);
  });

  it('gets a case by id', async () => {
    const moderationCase = { id: 'case-1' };
    caseService.getCase.mockResolvedValue(moderationCase);

    await expect(controller.getCase('case-1')).resolves.toEqual(moderationCase);
  });

  it('updates the status for the authenticated moderator', async () => {
    const dto = { status: 'DISMISSED' as const };
    const updated = { id: 'case-1', ...dto };
    caseService.updateStatus.mockResolvedValue(updated);

    await expect(controller.updateStatus('case-1', user, dto)).resolves.toEqual(updated);
    expect(caseService.updateStatus).toHaveBeenCalledWith('case-1', 'user-1', dto);
  });
});
