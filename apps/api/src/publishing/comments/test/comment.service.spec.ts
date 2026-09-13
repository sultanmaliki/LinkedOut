import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';

import { CommentService } from '../comment.service';

describe('CommentService', () => {
  const commentRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    listByPost: jest.fn(),
    updateContent: jest.fn(),
    deleteById: jest.fn(),
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

  const service = new CommentService(
    commentRepository as never,
    postRepository as never,
    companyRepository as never,
    profileRepository as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a top-level comment', async () => {
    postRepository.findById.mockResolvedValue({ id: 'post-1' });
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });

    const created = { id: 'comment-1', content: 'Nice post' };
    commentRepository.create.mockResolvedValue(created);

    await expect(
      service.createComment('post-1', 'user-1', { content: 'Nice post' }),
    ).resolves.toEqual(created);
  });

  it('creates a reply to a top-level comment', async () => {
    postRepository.findById.mockResolvedValue({ id: 'post-1' });
    commentRepository.findById.mockResolvedValue({
      id: 'comment-1',
      postId: 'post-1',
      parentCommentId: null,
    });
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });

    const created = { id: 'comment-2', parentCommentId: 'comment-1' };
    commentRepository.create.mockResolvedValue(created);

    await expect(
      service.createComment('post-1', 'user-1', {
        content: 'Agreed',
        parentCommentId: 'comment-1',
      }),
    ).resolves.toEqual(created);
  });

  it('rejects a reply to a reply (max nesting depth)', async () => {
    postRepository.findById.mockResolvedValue({ id: 'post-1' });
    commentRepository.findById.mockResolvedValue({
      id: 'comment-2',
      postId: 'post-1',
      parentCommentId: 'comment-1',
    });

    await expect(
      service.createComment('post-1', 'user-1', {
        content: 'Reply to a reply',
        parentCommentId: 'comment-2',
      }),
    ).rejects.toThrow(new ConflictException('Comments only support one level of replies'));

    expect(commentRepository.create).not.toHaveBeenCalled();
  });

  it('rejects a parent comment belonging to a different post', async () => {
    postRepository.findById.mockResolvedValue({ id: 'post-1' });
    commentRepository.findById.mockResolvedValue({
      id: 'comment-1',
      postId: 'other-post',
      parentCommentId: null,
    });

    await expect(
      service.createComment('post-1', 'user-1', {
        content: 'Reply',
        parentCommentId: 'comment-1',
      }),
    ).rejects.toThrow(new NotFoundException('Parent comment not found'));
  });

  it('creates a comment as a managed company', async () => {
    postRepository.findById.mockResolvedValue({ id: 'post-1' });
    companyRepository.findById.mockResolvedValue({ id: 'company-1' });
    companyRepository.isAdmin.mockResolvedValue(true);

    const created = { id: 'comment-1', companyId: 'company-1' };
    commentRepository.create.mockResolvedValue(created);

    await expect(
      service.createComment('post-1', 'user-1', { content: 'Thanks!', asCompanyId: 'company-1' }),
    ).resolves.toEqual(created);
  });

  it('updates a comment owned by the professional', async () => {
    commentRepository.findById.mockResolvedValue({
      id: 'comment-1',
      professionalProfileId: 'profile-1',
      companyId: null,
    });
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });

    const updated = { id: 'comment-1', content: 'Edited', edited: true };
    commentRepository.updateContent.mockResolvedValue(updated);

    await expect(
      service.updateComment('comment-1', 'user-1', { content: 'Edited' }),
    ).resolves.toEqual(updated);
  });

  it('throws when updating a comment owned by someone else', async () => {
    commentRepository.findById.mockResolvedValue({
      id: 'comment-1',
      professionalProfileId: 'profile-1',
      companyId: null,
    });
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-2' });

    await expect(
      service.updateComment('comment-1', 'user-2', { content: 'Edited' }),
    ).rejects.toThrow(new ForbiddenException('You do not own this comment'));
  });

  it('deletes a comment owned by the professional', async () => {
    commentRepository.findById.mockResolvedValue({
      id: 'comment-1',
      professionalProfileId: 'profile-1',
      companyId: null,
    });
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
    commentRepository.deleteById.mockResolvedValue(true);

    await expect(service.deleteComment('comment-1', 'user-1')).resolves.toBeUndefined();
  });
});
