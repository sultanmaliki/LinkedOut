import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../../auth/guards/auth.guard';
import { PostAttachmentController } from '../post-attachment.controller';
import { AttachmentService } from '../attachment.service';

describe('PostAttachmentController', () => {
  let controller: PostAttachmentController;

  const attachmentService = {
    listByPost: jest.fn(),
    createForPost: jest.fn(),
    deleteFromPost: jest.fn(),
  };

  const user: AuthenticatedUser = {
    id: 'user-1',
    email: 'ada@example.com',
    role: 'PROFESSIONAL',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostAttachmentController],
      providers: [{ provide: AttachmentService, useValue: attachmentService }],
    }).compile();

    controller = module.get<PostAttachmentController>(PostAttachmentController);
  });

  it('lists attachments for a post', async () => {
    const list = [{ id: 'attachment-1' }];
    attachmentService.listByPost.mockResolvedValue(list);

    await expect(controller.listByPost('post-1')).resolves.toEqual(list);
  });

  it('creates an attachment for the authenticated user', async () => {
    const dto = {
      type: 'IMAGE' as const,
      fileName: 'photo.png',
      fileUrl: 'https://cdn.example.com/photo.png',
      mimeType: 'image/png',
      fileSize: 1024,
    };
    const created = { id: 'attachment-1', ...dto };
    attachmentService.createForPost.mockResolvedValue(created);

    await expect(controller.createForPost('post-1', user, dto)).resolves.toEqual(created);
    expect(attachmentService.createForPost).toHaveBeenCalledWith('post-1', 'user-1', dto);
  });

  it('deletes an attachment for the authenticated user', async () => {
    attachmentService.deleteFromPost.mockResolvedValue(undefined);

    await controller.deleteFromPost('post-1', 'attachment-1', user);

    expect(attachmentService.deleteFromPost).toHaveBeenCalledWith(
      'post-1',
      'attachment-1',
      'user-1',
    );
  });
});
