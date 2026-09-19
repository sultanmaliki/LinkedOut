import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../../auth/guards/auth.guard';
import { CompanyOpportunityController } from '../company-opportunity.controller';
import { OpportunityService } from '../opportunity.service';

describe('CompanyOpportunityController', () => {
  let controller: CompanyOpportunityController;

  const opportunityService = {
    listByCompany: jest.fn(),
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
      controllers: [CompanyOpportunityController],
      providers: [{ provide: OpportunityService, useValue: opportunityService }],
    }).compile();

    controller = module.get<CompanyOpportunityController>(CompanyOpportunityController);
  });

  it('lists opportunities across every job for a company', async () => {
    const opportunities = [{ id: 'opportunity-1' }, { id: 'opportunity-2' }];
    opportunityService.listByCompany.mockResolvedValue(opportunities);

    await expect(controller.listOpportunities('company-1', user)).resolves.toEqual(opportunities);
    expect(opportunityService.listByCompany).toHaveBeenCalledWith('company-1', 'user-1');
  });
});
