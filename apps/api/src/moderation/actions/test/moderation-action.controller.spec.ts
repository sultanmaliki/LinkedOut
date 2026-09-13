import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../../auth/guards/auth.guard';
import { ModerationActionController } from '../moderation-action.controller';
import { ModerationActionService } from '../moderation-action.service';

describe('ModerationActionController', () => {
  let controller: ModerationActionController;

  const actionService = {
    listByCase: jest.fn(),
    createAction: jest.fn(),
  };

  const user: AuthenticatedUser = {
    id: 'moderator-1',
    email: 'mod@example.com',
    role: 'MODERATOR',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModerationActionController],
      providers: [{ provide: ModerationActionService, useValue: actionService }],
    }).compile();

    controller = module.get<ModerationActionController>(ModerationActionController);
  });

  it('lists actions for a case', async () => {
    const actions = [{ id: 'action-1' }];
    actionService.listByCase.mockResolvedValue(actions);

    await expect(controller.listByCase('case-1')).resolves.toEqual(actions);
  });

  it('creates an action for the authenticated moderator', async () => {
    const dto = { action: 'CONTENT_REMOVED' as const };
    const created = { id: 'action-1', ...dto };
    actionService.createAction.mockResolvedValue(created);

    await expect(controller.createAction('case-1', user, dto)).resolves.toEqual(created);
    expect(actionService.createAction).toHaveBeenCalledWith('case-1', 'moderator-1', dto);
  });
});
