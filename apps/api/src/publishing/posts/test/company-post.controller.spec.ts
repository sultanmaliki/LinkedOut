import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../../auth/guards/auth.guard';
import { CompanyPostController } from '../company-post.controller';
import { PostService } from '../post.service';

describe('CompanyPostController', () => {
  let controller: CompanyPostController;

  const postService = {
    listByCompanyId: jest.fn(),
  };

  const user: AuthenticatedUser = {
    id: 'user-1',
    email: 'ada@example.com',
    role: 'PROFESSIONAL',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyPostController],
      providers: [{ provide: PostService, useValue: postService }],
    }).compile();

    controller = module.get<CompanyPostController>(CompanyPostController);
  });

  it('lists posts for a company the authenticated user manages', async () => {
    const list = [{ id: 'post-1', companyId: 'company-1' }];
    postService.listByCompanyId.mockResolvedValue(list);

    await expect(controller.listCompanyPosts('company-1', user)).resolves.toEqual(list);
    expect(postService.listByCompanyId).toHaveBeenCalledWith('company-1', 'user-1');
  });
});
