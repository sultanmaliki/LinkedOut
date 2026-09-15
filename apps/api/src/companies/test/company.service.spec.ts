import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { CompanyService } from '../company.service';

describe('CompanyService', () => {
  const repository = {
    slugExists: jest.fn(),
    createWithProfileAndAdmin: jest.fn(),
    findById: jest.fn(),
    list: jest.fn(),
    listForAdmin: jest.fn(),
    isAdmin: jest.fn(),
    updateById: jest.fn(),
  };

  const service = new CompanyService(repository);

  const dto = {
    legalName: 'Acme Corp Ltd',
    displayName: 'Acme Corp',
    companyType: 'PRIVATE' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a company with a slug derived from the display name', async () => {
    repository.slugExists.mockResolvedValue(false);

    const created = { id: 'company-1', slug: 'acme-corp' };
    repository.createWithProfileAndAdmin.mockResolvedValue(created);

    await expect(service.createCompany('user-1', dto)).resolves.toEqual(created);

    expect(repository.createWithProfileAndAdmin).toHaveBeenCalledWith(
      { ...dto, slug: 'acme-corp' },
      'user-1',
    );
  });

  it('appends a random suffix when the derived slug is already taken', async () => {
    repository.slugExists.mockResolvedValueOnce(true).mockResolvedValueOnce(false);
    repository.createWithProfileAndAdmin.mockResolvedValue({ id: 'company-2' });

    await service.createCompany('user-1', dto);

    const [[createArgs]] = repository.createWithProfileAndAdmin.mock.calls;

    expect(createArgs.slug).toMatch(/^acme-corp-[a-z0-9]{4}$/);
  });

  it('lists companies using the provided pagination', async () => {
    const companies = [{ id: 'company-1' }];
    repository.list.mockResolvedValue(companies);

    await expect(service.listCompanies(10, 20)).resolves.toEqual(companies);
    expect(repository.list).toHaveBeenCalledWith(10, 20, undefined);
  });

  it('lists companies matching a search query', async () => {
    const companies = [{ id: 'company-1', displayName: 'Acme Corp' }];
    repository.list.mockResolvedValue(companies);

    await expect(service.listCompanies(20, 0, 'Acme')).resolves.toEqual(companies);
    expect(repository.list).toHaveBeenCalledWith(20, 0, 'Acme');
  });

  it('lists companies the user administers', async () => {
    const companies = [{ id: 'company-1' }];
    repository.listForAdmin.mockResolvedValue(companies);

    await expect(service.listMine('user-1')).resolves.toEqual(companies);
    expect(repository.listForAdmin).toHaveBeenCalledWith('user-1');
  });

  it('returns a company by id', async () => {
    const company = { id: 'company-1', displayName: 'Acme Corp' };
    repository.findById.mockResolvedValue(company);

    await expect(service.getCompany('company-1')).resolves.toEqual(company);
  });

  it('throws when the company does not exist', async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(service.getCompany('missing')).rejects.toThrow(
      new NotFoundException('Company not found'),
    );
  });

  it('updates a company when the user is an admin', async () => {
    repository.findById.mockResolvedValue({ id: 'company-1' });
    repository.isAdmin.mockResolvedValue(true);

    const updated = { id: 'company-1', displayName: 'Acme Corp Updated' };
    repository.updateById.mockResolvedValue(updated);

    await expect(
      service.updateCompany('company-1', 'user-1', { displayName: 'Acme Corp Updated' }),
    ).resolves.toEqual(updated);

    expect(repository.isAdmin).toHaveBeenCalledWith('company-1', 'user-1');
  });

  it('throws when the user does not manage the company', async () => {
    repository.findById.mockResolvedValue({ id: 'company-1' });
    repository.isAdmin.mockResolvedValue(false);

    await expect(
      service.updateCompany('company-1', 'user-2', { displayName: 'New Name' }),
    ).rejects.toThrow(new ForbiddenException('You do not manage this company'));

    expect(repository.updateById).not.toHaveBeenCalled();
  });

  it('throws when updating a company that does not exist', async () => {
    repository.findById.mockResolvedValue(undefined);

    await expect(
      service.updateCompany('missing', 'user-1', { displayName: 'New Name' }),
    ).rejects.toThrow(new NotFoundException('Company not found'));

    expect(repository.isAdmin).not.toHaveBeenCalled();
  });
});
