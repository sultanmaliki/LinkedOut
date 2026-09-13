import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { PostService } from '../post.service';

describe('PostService', () => {
  const postRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    listVisible: jest.fn(),
    listByProfessional: jest.fn(),
    updateContent: jest.fn(),
    archive: jest.fn(),
    restore: jest.fn(),
    deleteById: jest.fn(),
  };

  const companyRepository = {
    findById: jest.fn(),
    isAdmin: jest.fn(),
  };

  const profileRepository = {
    findByUserId: jest.fn(),
  };

  const service = new PostService(
    postRepository as never,
    companyRepository as never,
    profileRepository as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a post authored by the professional themselves', async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });

    const created = { id: 'post-1', professionalProfileId: 'profile-1', companyId: null };
    postRepository.create.mockResolvedValue(created);

    await expect(service.createPost('user-1', { content: 'Hello world' })).resolves.toEqual(
      created,
    );
    expect(postRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ professionalProfileId: 'profile-1', companyId: null }),
    );
  });

  it('creates a post authored by a company the user manages', async () => {
    companyRepository.findById.mockResolvedValue({ id: 'company-1' });
    companyRepository.isAdmin.mockResolvedValue(true);

    const created = { id: 'post-1', professionalProfileId: null, companyId: 'company-1' };
    postRepository.create.mockResolvedValue(created);

    await expect(
      service.createPost('user-1', { content: 'Hello world', asCompanyId: 'company-1' }),
    ).resolves.toEqual(created);
  });

  it('throws when creating a post as a company the user does not manage', async () => {
    companyRepository.findById.mockResolvedValue({ id: 'company-1' });
    companyRepository.isAdmin.mockResolvedValue(false);

    await expect(
      service.createPost('user-2', { content: 'Hello', asCompanyId: 'company-1' }),
    ).rejects.toThrow(new ForbiddenException('You do not manage this company'));
  });

  it('returns a visible post and strips archive fields', async () => {
    postRepository.findById.mockResolvedValue({
      id: 'post-1',
      visibility: 'VISIBLE_NOW',
      archivedAt: null,
      archivedBefore: false,
      content: 'Hello',
    });

    const post = await service.getPost('post-1');

    expect(post).not.toHaveProperty('archivedAt');
    expect(post).not.toHaveProperty('archivedBefore');
  });

  it('throws when a post is archived', async () => {
    postRepository.findById.mockResolvedValue({ id: 'post-1', visibility: 'ARCHIVED' });

    await expect(service.getPost('post-1')).rejects.toThrow(
      new NotFoundException('Post not found'),
    );
  });

  it('throws when a scheduled post has not reached its scheduled time', async () => {
    postRepository.findById.mockResolvedValue({
      id: 'post-1',
      visibility: 'SCHEDULED',
      scheduledAt: new Date(Date.now() + 60_000),
    });

    await expect(service.getPost('post-1')).rejects.toThrow(
      new NotFoundException('Post not found'),
    );
  });

  it('archives a post owned by the professional', async () => {
    postRepository.findById.mockResolvedValue({
      id: 'post-1',
      professionalProfileId: 'profile-1',
      companyId: null,
    });
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });

    const archived = { id: 'post-1', visibility: 'ARCHIVED' };
    postRepository.archive.mockResolvedValue(archived);

    await expect(service.archivePost('post-1', 'user-1')).resolves.toEqual(archived);
  });

  it('throws when archiving a post owned by someone else', async () => {
    postRepository.findById.mockResolvedValue({
      id: 'post-1',
      professionalProfileId: 'profile-1',
      companyId: null,
    });
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-2' });

    await expect(service.archivePost('post-1', 'user-2')).rejects.toThrow(
      new ForbiddenException('You do not own this post'),
    );
  });

  it('deletes a post owned by the professional', async () => {
    postRepository.findById.mockResolvedValue({
      id: 'post-1',
      professionalProfileId: 'profile-1',
      companyId: null,
    });
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
    postRepository.deleteById.mockResolvedValue(true);

    await expect(service.deletePost('post-1', 'user-1')).resolves.toBeUndefined();
  });
});
