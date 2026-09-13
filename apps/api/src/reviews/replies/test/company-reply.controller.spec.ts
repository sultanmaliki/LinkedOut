import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../../auth/guards/auth.guard';
import { CompanyReplyController } from '../company-reply.controller';
import { CompanyReplyService } from '../company-reply.service';

describe('CompanyReplyController', () => {
  let controller: CompanyReplyController;

  const replyService = {
    createReply: jest.fn(),
    updateReply: jest.fn(),
  };

  const user: AuthenticatedUser = {
    id: 'user-1',
    email: 'admin@example.com',
    role: 'PROFESSIONAL',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyReplyController],
      providers: [{ provide: CompanyReplyService, useValue: replyService }],
    }).compile();

    controller = module.get<CompanyReplyController>(CompanyReplyController);
  });

  it('creates a reply for the authenticated user', async () => {
    const dto = { reply: 'Thanks!' };
    const created = { id: 'reply-1', ...dto };
    replyService.createReply.mockResolvedValue(created);

    await expect(controller.createReply('review-1', user, dto)).resolves.toEqual(created);
    expect(replyService.createReply).toHaveBeenCalledWith('review-1', 'user-1', dto);
  });

  it('updates a reply for the authenticated user', async () => {
    const dto = { reply: 'Thanks again!' };
    const updated = { id: 'reply-1', ...dto };
    replyService.updateReply.mockResolvedValue(updated);

    await expect(controller.updateReply('review-1', user, dto)).resolves.toEqual(updated);
    expect(replyService.updateReply).toHaveBeenCalledWith('review-1', 'user-1', dto);
  });
});
