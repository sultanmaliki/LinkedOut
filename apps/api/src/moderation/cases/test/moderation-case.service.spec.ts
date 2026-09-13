import { NotFoundException } from '@nestjs/common';

import { ModerationCaseService } from '../moderation-case.service';

describe('ModerationCaseService', () => {
  const caseRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    list: jest.fn(),
    updateStatus: jest.fn(),
  };

  const auditLogService = {
    record: jest.fn(),
  };

  const service = new ModerationCaseService(caseRepository as never, auditLogService as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const dto = {
    targetType: 'REVIEW' as const,
    targetId: 'review-1',
    reason: 'FAKE_REVIEW' as const,
  };

  it('creates a moderation case and records an audit log entry', async () => {
    const created = { id: 'case-1', ...dto, status: 'OPEN' };
    caseRepository.create.mockResolvedValue(created);

    await expect(service.createCase('user-1', dto)).resolves.toEqual(created);
    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({ actorId: 'user-1', action: 'REVIEW_REPORTED' }),
    );
  });

  it('returns a case by id', async () => {
    const moderationCase = { id: 'case-1', status: 'OPEN' };
    caseRepository.findById.mockResolvedValue(moderationCase);

    await expect(service.getCase('case-1')).resolves.toEqual(moderationCase);
  });

  it('throws when the case does not exist', async () => {
    caseRepository.findById.mockResolvedValue(undefined);

    await expect(service.getCase('missing')).rejects.toThrow(
      new NotFoundException('Moderation case not found'),
    );
  });

  it('updates the status of an existing case and logs the change', async () => {
    caseRepository.findById.mockResolvedValue({ id: 'case-1', status: 'OPEN' });

    const updated = { id: 'case-1', status: 'UNDER_REVIEW' };
    caseRepository.updateStatus.mockResolvedValue(updated);

    await expect(
      service.updateStatus('case-1', 'moderator-1', { status: 'UNDER_REVIEW' }),
    ).resolves.toEqual(updated);
    expect(auditLogService.record).toHaveBeenCalledWith(
      expect.objectContaining({
        actorId: 'moderator-1',
        action: 'STATUS_CHANGED',
        metadata: { from: 'OPEN', to: 'UNDER_REVIEW' },
      }),
    );
  });
});
