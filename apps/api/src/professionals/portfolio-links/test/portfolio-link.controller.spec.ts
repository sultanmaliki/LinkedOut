import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../../auth/guards/auth.guard';
import { PortfolioLinkController } from '../portfolio-link.controller';
import { PortfolioLinkService } from '../portfolio-link.service';

describe('PortfolioLinkController', () => {
  let controller: PortfolioLinkController;

  const linkService = {
    listMyLinks: jest.fn(),
    createLink: jest.fn(),
    updateLink: jest.fn(),
    deleteLink: jest.fn(),
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
      controllers: [PortfolioLinkController],
      providers: [{ provide: PortfolioLinkService, useValue: linkService }],
    }).compile();

    controller = module.get<PortfolioLinkController>(PortfolioLinkController);
  });

  it('lists links for the authenticated user', async () => {
    const links = [{ id: 'link-1' }];
    linkService.listMyLinks.mockResolvedValue(links);

    await expect(controller.listMyLinks(user)).resolves.toEqual(links);
    expect(linkService.listMyLinks).toHaveBeenCalledWith('user-1');
  });

  it('creates a link for the authenticated user', async () => {
    const dto = { title: 'GitHub', url: 'https://github.com/ada' };
    const created = { id: 'link-1', ...dto };
    linkService.createLink.mockResolvedValue(created);

    await expect(controller.createLink(user, dto)).resolves.toEqual(created);
    expect(linkService.createLink).toHaveBeenCalledWith('user-1', dto);
  });

  it('updates a link for the authenticated user', async () => {
    const dto = { title: 'Portfolio' };
    const updated = { id: 'link-1', ...dto };
    linkService.updateLink.mockResolvedValue(updated);

    await expect(controller.updateLink('link-1', user, dto)).resolves.toEqual(updated);
    expect(linkService.updateLink).toHaveBeenCalledWith('user-1', 'link-1', dto);
  });

  it('deletes a link for the authenticated user', async () => {
    linkService.deleteLink.mockResolvedValue(undefined);

    await controller.deleteLink('link-1', user);

    expect(linkService.deleteLink).toHaveBeenCalledWith('user-1', 'link-1');
  });
});
