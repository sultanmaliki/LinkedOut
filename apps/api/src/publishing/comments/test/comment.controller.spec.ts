import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../../auth/guards/auth.guard';
import { CommentController } from '../comment.controller';
import { CommentService } from '../comment.service';

describe('CommentController', () => {
  let controller: CommentController;

  const commentService = {
    updateComment: jest.fn(),
    deleteComment: jest.fn(),
  };

  const user: AuthenticatedUser = {
    id: 'user-1',
    email: 'ada@example.com',
    role: 'PROFESSIONAL',
    emailVerified: true,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentController],
      providers: [{ provide: CommentService, useValue: commentService }],
    }).compile();

    controller = module.get<CommentController>(CommentController);
  });

  it('updates a comment for the authenticated user', async () => {
    const dto = { content: 'Edited' };
    const updated = { id: 'comment-1', ...dto };
    commentService.updateComment.mockResolvedValue(updated);

    await expect(controller.updateComment('comment-1', user, dto)).resolves.toEqual(updated);
    expect(commentService.updateComment).toHaveBeenCalledWith('comment-1', 'user-1', dto);
  });

  it('deletes a comment for the authenticated user', async () => {
    commentService.deleteComment.mockResolvedValue(undefined);

    await controller.deleteComment('comment-1', user);

    expect(commentService.deleteComment).toHaveBeenCalledWith('comment-1', 'user-1');
  });
});
