import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../../auth/guards/auth.guard';
import { PostCommentController } from '../post-comment.controller';
import { CommentService } from '../comment.service';

describe('PostCommentController', () => {
  let controller: PostCommentController;

  const commentService = {
    listByPost: jest.fn(),
    createComment: jest.fn(),
  };

  const user: AuthenticatedUser = {
    id: 'user-1',
    email: 'ada@example.com',
    role: 'PROFESSIONAL',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostCommentController],
      providers: [{ provide: CommentService, useValue: commentService }],
    }).compile();

    controller = module.get<PostCommentController>(PostCommentController);
  });

  it('lists comments for a post', async () => {
    const list = [{ id: 'comment-1' }];
    commentService.listByPost.mockResolvedValue(list);

    await expect(controller.listByPost('post-1')).resolves.toEqual(list);
  });

  it('creates a comment for the authenticated user', async () => {
    const dto = { content: 'Nice post' };
    const created = { id: 'comment-1', ...dto };
    commentService.createComment.mockResolvedValue(created);

    await expect(controller.createComment('post-1', user, dto)).resolves.toEqual(created);
    expect(commentService.createComment).toHaveBeenCalledWith('post-1', 'user-1', dto);
  });
});
