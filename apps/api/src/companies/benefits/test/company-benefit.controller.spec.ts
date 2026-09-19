import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../../auth/guards/auth.guard';
import { CompanyBenefitController } from '../company-benefit.controller';
import { CompanyBenefitService } from '../company-benefit.service';

describe('CompanyBenefitController', () => {
  let controller: CompanyBenefitController;

  const benefitService = {
    listBenefits: jest.fn(),
    setBenefits: jest.fn(),
  };

  const user: AuthenticatedUser = {
    id: 'user-1',
    email: 'admin@example.com',
    role: 'PROFESSIONAL',
    emailVerified: true,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyBenefitController],
      providers: [
        {
          provide: CompanyBenefitService,
          useValue: benefitService,
        },
      ],
    }).compile();

    controller = module.get<CompanyBenefitController>(CompanyBenefitController);
  });

  it('lists benefits for a company', async () => {
    const benefits = [{ id: 'benefit-1', name: 'Health insurance' }];
    benefitService.listBenefits.mockResolvedValue(benefits);

    await expect(controller.listBenefits('company-1')).resolves.toEqual(benefits);
    expect(benefitService.listBenefits).toHaveBeenCalledWith('company-1');
  });

  it('sets benefits for the authenticated user', async () => {
    const dto = { benefits: ['Health insurance'] };
    const result = [{ id: 'benefit-1', name: 'Health insurance' }];
    benefitService.setBenefits.mockResolvedValue(result);

    await expect(controller.setBenefits('company-1', user, dto)).resolves.toEqual(result);
    expect(benefitService.setBenefits).toHaveBeenCalledWith('company-1', 'user-1', dto);
  });
});
