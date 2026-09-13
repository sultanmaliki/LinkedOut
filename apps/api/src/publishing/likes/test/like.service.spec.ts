import { NotFoundException } from '@nestjs/common';

import { LikeService } from '../like.service';

describe('LikeService', () => {
  const likeRepository = {
    findByActor: jest.fn(),
    create: jest.fn(),
    deleteByActor: jest.fn(),
    countByPost: jest.fn(),
  };

  const postRepository = {
    findById: jest.fn(),
  };

  const companyRepository = {
    findById: jest.fn(),
    isAdmin: jest.fn(),
  };

  const profileRepository = {
    findByUserId: jest.fn(),
  };

  const service = new LikeService(
    likeRepository as never,
    postRepository as never,
    companyRepository as never,
    profileRepository as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('likes a post that was not previously liked', async () => {
    postRepository.findById.mockResolvedValue({ id: 'post-1' });
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
    likeRepository.findByActor.mockResolvedValue(undefined);

    await expect(service.toggleLike('post-1', 'user-1')).resolves.toEqual({ liked: true });
    expect(likeRepository.create).toHaveBeenCalledWith('post-1', {
      professionalProfileId: 'profile-1',
      companyId: null,
    });
  });

  it('unlikes a post that was already liked', async () => {
    postRepository.findById.mockResolvedValue({ id: 'post-1' });
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
    likeRepository.findByActor.mockResolvedValue({ postId: 'post-1' });

    await expect(service.toggleLike('post-1', 'user-1')).resolves.toEqual({ liked: false });
    expect(likeRepository.deleteByActor).toHaveBeenCalled();
    expect(likeRepository.create).not.toHaveBeenCalled();
  });

  it('throws when the post does not exist', async () => {
    postRepository.findById.mockResolvedValue(undefined);

    await expect(service.toggleLike('missing', 'user-1')).rejects.toThrow(
      new NotFoundException('Post not found'),
    );
  });

  it('returns the like count for a post', async () => {
    postRepository.findById.mockResolvedValue({ id: 'post-1' });
    likeRepository.countByPost.mockResolvedValue(3);

    await expect(service.getLikeCount('post-1')).resolves.toEqual({ count: 3 });
  });
});
