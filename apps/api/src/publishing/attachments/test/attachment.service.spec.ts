import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';

import { AttachmentService } from '../attachment.service';

describe('AttachmentService', () => {
  const attachmentRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    listByPost: jest.fn(),
    deleteById: jest.fn(),
  };

  const postRepository = {
    findById: jest.fn(),
  };

  const postService = {
    isOwner: jest.fn(),
  };

  const service = new AttachmentService(
    attachmentRepository as never,
    postRepository as never,
    postService as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a standalone PDF attachment', async () => {
    const dto = {
      type: 'PDF' as const,
      fileName: 'resume.pdf',
      fileUrl: 'https://cdn.example.com/resume.pdf',
      mimeType: 'application/pdf',
      fileSize: 1024,
    };
    const created = { id: 'attachment-1', postId: null, ...dto };
    attachmentRepository.create.mockResolvedValue(created);

    await expect(service.createStandalone(dto)).resolves.toEqual(created);
  });

  it('rejects a standalone image attachment', async () => {
    const dto = {
      type: 'IMAGE' as const,
      fileName: 'photo.png',
      fileUrl: 'https://cdn.example.com/photo.png',
      mimeType: 'image/png',
      fileSize: 1024,
    };

    await expect(service.createStandalone(dto)).rejects.toThrow(
      new ConflictException('Only standalone PDF attachments are allowed without a post'),
    );

    expect(attachmentRepository.create).not.toHaveBeenCalled();
  });

  it('creates an image attachment for a post owned by the user', async () => {
    postRepository.findById.mockResolvedValue({ id: 'post-1' });
    postService.isOwner.mockResolvedValue(true);

    const dto = {
      type: 'IMAGE' as const,
      fileName: 'photo.png',
      fileUrl: 'https://cdn.example.com/photo.png',
      mimeType: 'image/png',
      fileSize: 1024,
    };
    const created = { id: 'attachment-1', postId: 'post-1', ...dto };
    attachmentRepository.create.mockResolvedValue(created);

    await expect(service.createForPost('post-1', 'user-1', dto)).resolves.toEqual(created);
  });

  it('throws when creating an attachment for a post not owned by the user', async () => {
    postRepository.findById.mockResolvedValue({ id: 'post-1' });
    postService.isOwner.mockResolvedValue(false);

    const dto = {
      type: 'IMAGE' as const,
      fileName: 'photo.png',
      fileUrl: 'https://cdn.example.com/photo.png',
      mimeType: 'image/png',
      fileSize: 1024,
    };

    await expect(service.createForPost('post-1', 'user-2', dto)).rejects.toThrow(
      new ForbiddenException('You do not own this post'),
    );
  });

  it('lists attachments for an existing post', async () => {
    postRepository.findById.mockResolvedValue({ id: 'post-1' });
    const list = [{ id: 'attachment-1' }];
    attachmentRepository.listByPost.mockResolvedValue(list);

    await expect(service.listByPost('post-1')).resolves.toEqual(list);
  });

  it('deletes an attachment owned via its post', async () => {
    postRepository.findById.mockResolvedValue({ id: 'post-1' });
    postService.isOwner.mockResolvedValue(true);
    attachmentRepository.findById.mockResolvedValue({ id: 'attachment-1', postId: 'post-1' });
    attachmentRepository.deleteById.mockResolvedValue(true);

    await expect(
      service.deleteFromPost('post-1', 'attachment-1', 'user-1'),
    ).resolves.toBeUndefined();
  });

  it('throws when the attachment does not belong to the post', async () => {
    postRepository.findById.mockResolvedValue({ id: 'post-1' });
    postService.isOwner.mockResolvedValue(true);
    attachmentRepository.findById.mockResolvedValue({ id: 'attachment-1', postId: 'other-post' });

    await expect(service.deleteFromPost('post-1', 'attachment-1', 'user-1')).rejects.toThrow(
      new NotFoundException('Attachment not found'),
    );
  });
});
