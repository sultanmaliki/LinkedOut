import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../../auth/guards/auth.guard';
import { LikeController } from '../like.controller';
import { LikeService } from '../like.service';

describe('LikeController', () => {
  let controller: LikeController;

  const likeService = {
    getLikeCount: jest.fn(),
    toggleLike: jest.fn(),
  };

  const user: AuthenticatedUser = {
    id: 'user-1',
    email: 'ada@example.com',
    role: 'PROFESSIONAL',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LikeController],
      providers: [{ provide: LikeService, useValue: likeService }],
    }).compile();

    controller = module.get<LikeController>(LikeController);
  });

  it('gets the like count for a post', async () => {
    likeService.getLikeCount.mockResolvedValue({ count: 2 });

    await expect(controller.getLikeCount('post-1')).resolves.toEqual({ count: 2 });
  });

  it('toggles a like for the authenticated user', async () => {
    likeService.toggleLike.mockResolvedValue({ liked: true });

    await expect(controller.toggleLike('post-1', user, {})).resolves.toEqual({ liked: true });
    expect(likeService.toggleLike).toHaveBeenCalledWith('post-1', 'user-1', undefined);
  });
});
