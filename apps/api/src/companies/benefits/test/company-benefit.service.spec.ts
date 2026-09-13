import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { CompanyBenefitService } from '../company-benefit.service';

describe('CompanyBenefitService', () => {
  const benefitRepository = {
    listByCompany: jest.fn(),
    replaceForCompany: jest.fn(),
  };

  const companyRepository = {
    findById: jest.fn(),
    isAdmin: jest.fn(),
  };

  const service = new CompanyBenefitService(benefitRepository as never, companyRepository as never);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists benefits for an existing company', async () => {
    companyRepository.findById.mockResolvedValue({ id: 'company-1' });

    const benefits = [{ id: 'benefit-1', name: 'Health insurance' }];
    benefitRepository.listByCompany.mockResolvedValue(benefits);

    await expect(service.listBenefits('company-1')).resolves.toEqual(benefits);
  });

  it('throws when listing benefits for a company that does not exist', async () => {
    companyRepository.findById.mockResolvedValue(undefined);

    await expect(service.listBenefits('missing')).rejects.toThrow(
      new NotFoundException('Company not found'),
    );
  });

  it('replaces benefits when the user manages the company', async () => {
    companyRepository.findById.mockResolvedValue({ id: 'company-1' });
    companyRepository.isAdmin.mockResolvedValue(true);

    const benefits = [{ id: 'benefit-1', name: 'Health insurance' }];
    benefitRepository.replaceForCompany.mockResolvedValue(benefits);

    await expect(
      service.setBenefits('company-1', 'user-1', { benefits: ['Health insurance'] }),
    ).resolves.toEqual(benefits);
    expect(benefitRepository.replaceForCompany).toHaveBeenCalledWith('company-1', [
      'Health insurance',
    ]);
  });

  it('throws when a non-admin tries to set benefits', async () => {
    companyRepository.findById.mockResolvedValue({ id: 'company-1' });
    companyRepository.isAdmin.mockResolvedValue(false);

    await expect(
      service.setBenefits('company-1', 'user-2', { benefits: ['Health insurance'] }),
    ).rejects.toThrow(new ForbiddenException('You do not manage this company'));

    expect(benefitRepository.replaceForCompany).not.toHaveBeenCalled();
  });
});
