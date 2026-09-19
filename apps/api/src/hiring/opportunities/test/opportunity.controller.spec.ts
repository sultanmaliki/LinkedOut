import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../../auth/guards/auth.guard';
import { OpportunityController } from '../opportunity.controller';
import { OpportunityService } from '../opportunity.service';

describe('OpportunityController', () => {
  let controller: OpportunityController;

  const opportunityService = {
    getOpportunity: jest.fn(),
    getContactMethods: jest.fn(),
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
      controllers: [OpportunityController],
      providers: [{ provide: OpportunityService, useValue: opportunityService }],
    }).compile();

    controller = module.get<OpportunityController>(OpportunityController);
  });

  it('gets an opportunity for the authenticated user', async () => {
    const opportunity = { id: 'opportunity-1' };
    opportunityService.getOpportunity.mockResolvedValue(opportunity);

    await expect(controller.getOpportunity('opportunity-1', user)).resolves.toEqual(opportunity);
    expect(opportunityService.getOpportunity).toHaveBeenCalledWith('opportunity-1', 'user-1');
  });

  it('gets contact methods for the authenticated user', async () => {
    const methods = [{ id: 'cm-1', type: 'EMAIL', value: 'a@example.com' }];
    opportunityService.getContactMethods.mockResolvedValue(methods);

    await expect(controller.getContactMethods('opportunity-1', user)).resolves.toEqual(methods);
    expect(opportunityService.getContactMethods).toHaveBeenCalledWith('opportunity-1', 'user-1');
  });
});
