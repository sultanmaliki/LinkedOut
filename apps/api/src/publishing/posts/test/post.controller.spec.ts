import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../../auth/guards/auth.guard';
import { PostController } from '../post.controller';
import { PostService } from '../post.service';

describe('PostController', () => {
  let controller: PostController;

  const postService = {
    createPost: jest.fn(),
    listPublicPosts: jest.fn(),
    getPost: jest.fn(),
    updatePost: jest.fn(),
    archivePost: jest.fn(),
    restorePost: jest.fn(),
    deletePost: jest.fn(),
  };

  const user: AuthenticatedUser = {
    id: 'user-1',
    email: 'ada@example.com',
    role: 'PROFESSIONAL',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostController],
      providers: [{ provide: PostService, useValue: postService }],
    }).compile();

    controller = module.get<PostController>(PostController);
  });

  it('creates a post for the authenticated user', async () => {
    const dto = { content: 'Hello world' };
    const created = { id: 'post-1', ...dto };
    postService.createPost.mockResolvedValue(created);

    await expect(controller.createPost(user, dto)).resolves.toEqual(created);
    expect(postService.createPost).toHaveBeenCalledWith('user-1', dto);
  });

  it('lists public posts', async () => {
    const list = [{ id: 'post-1' }];
    postService.listPublicPosts.mockResolvedValue(list);

    await expect(controller.listPosts({})).resolves.toEqual(list);
  });

  it('gets a post by id', async () => {
    const post = { id: 'post-1' };
    postService.getPost.mockResolvedValue(post);

    await expect(controller.getPost('post-1')).resolves.toEqual(post);
  });

  it('updates a post for the authenticated user', async () => {
    const dto = { content: 'Updated' };
    const updated = { id: 'post-1', ...dto };
    postService.updatePost.mockResolvedValue(updated);

    await expect(controller.updatePost('post-1', user, dto)).resolves.toEqual(updated);
    expect(postService.updatePost).toHaveBeenCalledWith('post-1', 'user-1', dto);
  });

  it('archives a post for the authenticated user', async () => {
    const archived = { id: 'post-1', visibility: 'ARCHIVED' };
    postService.archivePost.mockResolvedValue(archived);

    await expect(controller.archivePost('post-1', user)).resolves.toEqual(archived);
  });

  it('restores a post for the authenticated user', async () => {
    const restored = { id: 'post-1', visibility: 'VISIBLE_NOW' };
    postService.restorePost.mockResolvedValue(restored);

    await expect(controller.restorePost('post-1', user)).resolves.toEqual(restored);
  });

  it('deletes a post for the authenticated user', async () => {
    postService.deletePost.mockResolvedValue(undefined);

    await controller.deletePost('post-1', user);

    expect(postService.deletePost).toHaveBeenCalledWith('post-1', 'user-1');
  });
});
