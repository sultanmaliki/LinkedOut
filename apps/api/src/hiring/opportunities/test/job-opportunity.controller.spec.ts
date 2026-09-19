import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../../auth/guards/auth.guard';
import { JobOpportunityController } from '../job-opportunity.controller';
import { OpportunityService } from '../opportunity.service';

describe('JobOpportunityController', () => {
  let controller: JobOpportunityController;

  const opportunityService = {
    createOpportunity: jest.fn(),
    listByJob: jest.fn(),
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
      controllers: [JobOpportunityController],
      providers: [{ provide: OpportunityService, useValue: opportunityService }],
    }).compile();

    controller = module.get<JobOpportunityController>(JobOpportunityController);
  });

  it('creates an opportunity for the authenticated user', async () => {
    const dto = { professionalProfileId: 'profile-1' };
    const created = { id: 'opportunity-1' };
    opportunityService.createOpportunity.mockResolvedValue(created);

    await expect(controller.createOpportunity('job-1', user, dto)).resolves.toEqual(created);
    expect(opportunityService.createOpportunity).toHaveBeenCalledWith('job-1', 'user-1', dto);
  });

  it('lists opportunities for a job', async () => {
    const opportunities = [{ id: 'opportunity-1' }];
    opportunityService.listByJob.mockResolvedValue(opportunities);

    await expect(controller.listOpportunities('job-1', user)).resolves.toEqual(opportunities);
    expect(opportunityService.listByJob).toHaveBeenCalledWith('job-1', 'user-1');
  });
});
