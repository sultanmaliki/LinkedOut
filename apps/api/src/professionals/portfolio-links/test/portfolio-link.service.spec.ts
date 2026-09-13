import { NotFoundException } from '@nestjs/common';

import { PortfolioLinkService } from '../portfolio-link.service';

describe('PortfolioLinkService', () => {
  const linkRepository = {
    create: jest.fn(),
    listByProfile: jest.fn(),
    findById: jest.fn(),
    updateById: jest.fn(),
    deleteById: jest.fn(),
  };

  const profileRepository = {
    findByUserId: jest.fn(),
  };

  const service = new PortfolioLinkService(linkRepository as never, profileRepository as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists links for the authenticated user', async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
    const links = [{ id: 'link-1' }];
    linkRepository.listByProfile.mockResolvedValue(links);

    await expect(service.listMyLinks('user-1')).resolves.toEqual(links);
    expect(linkRepository.listByProfile).toHaveBeenCalledWith('profile-1');
  });

  it('throws when the professional profile does not exist', async () => {
    profileRepository.findByUserId.mockResolvedValue(undefined);

    await expect(service.listMyLinks('missing')).rejects.toThrow(
      new NotFoundException('Professional profile not found'),
    );
  });

  it('creates a link for the authenticated user', async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });

    const dto = { title: 'GitHub', url: 'https://github.com/ada' };
    const created = { id: 'link-1', ...dto };
    linkRepository.create.mockResolvedValue(created);

    await expect(service.createLink('user-1', dto)).resolves.toEqual(created);
    expect(linkRepository.create).toHaveBeenCalledWith('profile-1', dto);
  });

  it('updates a link that exists', async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
    linkRepository.findById.mockResolvedValue({ id: 'link-1' });

    const updated = { id: 'link-1', title: 'Portfolio' };
    linkRepository.updateById.mockResolvedValue(updated);

    await expect(service.updateLink('user-1', 'link-1', { title: 'Portfolio' })).resolves.toEqual(
      updated,
    );
  });

  it('throws when updating a link that does not exist', async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
    linkRepository.findById.mockResolvedValue(undefined);

    await expect(service.updateLink('user-1', 'missing', { title: 'Portfolio' })).rejects.toThrow(
      new NotFoundException('Portfolio link not found'),
    );

    expect(linkRepository.updateById).not.toHaveBeenCalled();
  });

  it('deletes a link that exists', async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
    linkRepository.deleteById.mockResolvedValue(true);

    await expect(service.deleteLink('user-1', 'link-1')).resolves.toBeUndefined();
  });

  it('throws when deleting a link that does not exist', async () => {
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
    linkRepository.deleteById.mockResolvedValue(false);

    await expect(service.deleteLink('user-1', 'missing')).rejects.toThrow(
      new NotFoundException('Portfolio link not found'),
    );
  });
});
