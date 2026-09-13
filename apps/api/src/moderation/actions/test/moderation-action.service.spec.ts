import { NotFoundException } from '@nestjs/common';

import { ModerationActionService } from '../moderation-action.service';

describe('ModerationActionService', () => {
  const actionRepository = {
    create: jest.fn(),
    listByCase: jest.fn(),
  };

  const caseRepository = {
    findById: jest.fn(),
    updateStatus: jest.fn(),
  };

  const auditLogService = {
    record: jest.fn(),
  };

  const service = new ModerationActionService(
    actionRepository as never,
    caseRepository as never,
    auditLogService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates an action, marks the case as actioned, and logs it', async () => {
    caseRepository.findById.mockResolvedValue({
      id: 'case-1',
      targetType: 'REVIEW',
      targetId: 'review-1',
    });

    const created = { id: 'action-1', action: 'CONTENT_REMOVED' };
    actionRepository.create.mockResolvedValue(created);

    await expect(
      service.createAction('case-1', 'moderator-1', { action: 'CONTENT_REMOVED' }),
    ).resolves.toEqual(created);

    expect(caseRepository.updateStatus).toHaveBeenCalledWith('case-1', 'ACTION_TAKEN');
    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'moderator-1',
        entityType: 'REVIEW',
        entityId: 'review-1',
        action: 'CONTENT_REMOVED',
      }),
    );
  });

  it('throws when the case does not exist', async () => {
    caseRepository.findById.mockResolvedValue(undefined);

    await expect(
      service.createAction('missing', 'moderator-1', { action: 'NO_ACTION' }),
    ).rejects.toThrow(new NotFoundException('Moderation case not found'));

    expect(actionRepository.create).not.toHaveBeenCalled();
  });

  it('lists actions for an existing case', async () => {
    caseRepository.findById.mockResolvedValue({ id: 'case-1' });
    const actions = [{ id: 'action-1' }];
    actionRepository.listByCase.mockResolvedValue(actions);

    await expect(service.listByCase('case-1')).resolves.toEqual(actions);
  });
});
