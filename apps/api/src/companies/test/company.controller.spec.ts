import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../auth/guards/auth.guard';
import { CompanyController } from '../company.controller';
import { CompanyService } from '../company.service';

describe('CompanyController', () => {
  let controller: CompanyController;

  const companyService = {
    createCompany: jest.fn(),
    listCompanies: jest.fn(),
    listMine: jest.fn(),
    getCompany: jest.fn(),
    updateCompany: jest.fn(),
  };

  const user: AuthenticatedUser = {
    id: 'user-1',
    email: 'admin@example.com',
    role: 'PROFESSIONAL',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyController],
      providers: [
        {
          provide: CompanyService,
          useValue: companyService,
        },
      ],
    }).compile();

    controller = module.get<CompanyController>(CompanyController);
  });

  it('creates a company for the authenticated user', async () => {
    const dto = {
      legalName: 'Acme Corp Ltd',
      displayName: 'Acme Corp',
      companyType: 'PRIVATE' as const,
    };

    const company = { id: 'company-1', ...dto };
    companyService.createCompany.mockResolvedValue(company);

    await expect(controller.createCompany(user, dto)).resolves.toEqual(company);
    expect(companyService.createCompany).toHaveBeenCalledWith('user-1', dto);
  });

  it('lists companies with default pagination when none is provided', async () => {
    const companies = [{ id: 'company-1' }];
    companyService.listCompanies.mockResolvedValue(companies);

    await expect(controller.listCompanies({})).resolves.toEqual(companies);
    expect(companyService.listCompanies).toHaveBeenCalledWith(20, 0);
  });

  it('lists companies with the requested pagination', async () => {
    companyService.listCompanies.mockResolvedValue([]);

    await controller.listCompanies({ limit: 5, offset: 10 });

    expect(companyService.listCompanies).toHaveBeenCalledWith(5, 10);
  });

  it('lists companies the authenticated user administers', async () => {
    const companies = [{ id: 'company-1' }];
    companyService.listMine.mockResolvedValue(companies);

    await expect(controller.listMine(user)).resolves.toEqual(companies);
    expect(companyService.listMine).toHaveBeenCalledWith('user-1');
  });

  it('gets a company by id', async () => {
    const company = { id: 'company-1' };
    companyService.getCompany.mockResolvedValue(company);

    await expect(controller.getCompany('company-1')).resolves.toEqual(company);
    expect(companyService.getCompany).toHaveBeenCalledWith('company-1');
  });

  it('updates a company for the authenticated user', async () => {
    const dto = { displayName: 'Acme Corp Updated' };
    const updated = { id: 'company-1', ...dto };
    companyService.updateCompany.mockResolvedValue(updated);

    await expect(controller.updateCompany('company-1', user, dto)).resolves.toEqual(updated);
    expect(companyService.updateCompany).toHaveBeenCalledWith('company-1', 'user-1', dto);
  });
});
