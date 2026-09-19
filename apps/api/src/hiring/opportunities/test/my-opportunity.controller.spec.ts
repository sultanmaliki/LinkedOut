import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../../auth/guards/auth.guard';
import { MyOpportunityController } from '../my-opportunity.controller';
import { OpportunityService } from '../opportunity.service';

describe('MyOpportunityController', () => {
  let controller: MyOpportunityController;

  const opportunityService = {
    listMyOpportunities: jest.fn(),
    respond: jest.fn(),
    withdraw: jest.fn(),
    respondToOffer: jest.fn(),
    flagUnresponsive: jest.fn(),
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
      controllers: [MyOpportunityController],
      providers: [{ provide: OpportunityService, useValue: opportunityService }],
    }).compile();

    controller = module.get<MyOpportunityController>(MyOpportunityController);
  });

  it('lists opportunities for the authenticated professional', async () => {
    const opportunities = [{ id: 'opportunity-1' }];
    opportunityService.listMyOpportunities.mockResolvedValue(opportunities);

    await expect(controller.listMyOpportunities(user)).resolves.toEqual(opportunities);
    expect(opportunityService.listMyOpportunities).toHaveBeenCalledWith('user-1');
  });

  it('responds to an opportunity for the authenticated user', async () => {
    const dto = { accepted: true, contactMethods: [{ type: 'EMAIL' as const, value: 'a@b.com' }] };
    const updated = { id: 'opportunity-1', status: 'ACCEPTED' };
    opportunityService.respond.mockResolvedValue(updated);

    await expect(controller.respond('opportunity-1', user, dto)).resolves.toEqual(updated);
    expect(opportunityService.respond).toHaveBeenCalledWith('opportunity-1', 'user-1', dto);
  });

  it('withdraws an opportunity for the authenticated user', async () => {
    const withdrawn = { id: 'opportunity-1', status: 'WITHDRAWN' };
    opportunityService.withdraw.mockResolvedValue(withdrawn);

    await expect(controller.withdraw('opportunity-1', user)).resolves.toEqual(withdrawn);
    expect(opportunityService.withdraw).toHaveBeenCalledWith('opportunity-1', 'user-1');
  });

  it('responds to a released offer for the authenticated user', async () => {
    const updated = { id: 'opportunity-1', displayStatus: { stage: 'OFFER_ACCEPTED' } };
    opportunityService.respondToOffer.mockResolvedValue(updated);

    await expect(
      controller.respondToOffer('opportunity-1', user, { accepted: true }),
    ).resolves.toEqual(updated);
    expect(opportunityService.respondToOffer).toHaveBeenCalledWith('opportunity-1', 'user-1', true);
  });

  it('flags an opportunity as unresponsive for the authenticated user', async () => {
    const flagged = { id: 'opportunity-1', displayStatus: { tier: 'hardClosed' } };
    opportunityService.flagUnresponsive.mockResolvedValue(flagged);

    await expect(controller.flagUnresponsive('opportunity-1', user)).resolves.toEqual(flagged);
    expect(opportunityService.flagUnresponsive).toHaveBeenCalledWith('opportunity-1', 'user-1');
  });
});
