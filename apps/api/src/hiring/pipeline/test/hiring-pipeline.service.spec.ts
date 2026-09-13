import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { HiringPipelineService } from '../hiring-pipeline.service';

describe('HiringPipelineService', () => {
  const pipelineRepository = {
    listByOpportunity: jest.fn(),
    append: jest.fn(),
  };

  const opportunityRepository = {
    findById: jest.fn(),
  };

  const jobRepository = {
    findById: jest.fn(),
  };

  const companyRepository = {
    isAdmin: jest.fn(),
  };

  const profileRepository = {
    findByUserId: jest.fn(),
  };

  const service = new HiringPipelineService(
    pipelineRepository as never,
    opportunityRepository as never,
    jobRepository as never,
    companyRepository as never,
    profileRepository as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists stages for the owning professional', async () => {
    opportunityRepository.findById.mockResolvedValue({
      id: 'opportunity-1',
      professionalProfileId: 'profile-1',
      jobId: 'job-1',
    });
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });

    const stages = [{ id: 'stage-1', stage: 'OPPORTUNITY_SENT' }];
    pipelineRepository.listByOpportunity.mockResolvedValue(stages);

    await expect(service.listStages('opportunity-1', 'user-1')).resolves.toEqual(stages);
  });

  it('lists stages for the managing company admin', async () => {
    opportunityRepository.findById.mockResolvedValue({
      id: 'opportunity-1',
      professionalProfileId: 'profile-1',
      jobId: 'job-1',
    });
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-2' });
    jobRepository.findById.mockResolvedValue({ id: 'job-1', companyId: 'company-1' });
    companyRepository.isAdmin.mockResolvedValue(true);

    const stages = [{ id: 'stage-1', stage: 'OPPORTUNITY_SENT' }];
    pipelineRepository.listByOpportunity.mockResolvedValue(stages);

    await expect(service.listStages('opportunity-1', 'user-2')).resolves.toEqual(stages);
  });

  it('denies access to unrelated users', async () => {
    opportunityRepository.findById.mockResolvedValue({
      id: 'opportunity-1',
      professionalProfileId: 'profile-1',
      jobId: 'job-1',
    });
    profileRepository.findByUserId.mockResolvedValue({ id: 'profile-2' });
    jobRepository.findById.mockResolvedValue({ id: 'job-1', companyId: 'company-1' });
    companyRepository.isAdmin.mockResolvedValue(false);

    await expect(service.listStages('opportunity-1', 'user-3')).rejects.toThrow(
      new ForbiddenException('You do not have access to this opportunity'),
    );
  });

  it('appends a stage when the user manages the company', async () => {
    opportunityRepository.findById.mockResolvedValue({ id: 'opportunity-1', jobId: 'job-1' });
    jobRepository.findById.mockResolvedValue({ id: 'job-1', companyId: 'company-1' });
    companyRepository.isAdmin.mockResolvedValue(true);

    const stage = { id: 'stage-1', stage: 'SCREENING' };
    pipelineRepository.append.mockResolvedValue(stage);

    await expect(
      service.appendStage('opportunity-1', 'user-1', { stage: 'SCREENING' }),
    ).resolves.toEqual(stage);
  });

  it('throws when a non-admin tries to append a stage', async () => {
    opportunityRepository.findById.mockResolvedValue({ id: 'opportunity-1', jobId: 'job-1' });
    jobRepository.findById.mockResolvedValue({ id: 'job-1', companyId: 'company-1' });
    companyRepository.isAdmin.mockResolvedValue(false);

    await expect(
      service.appendStage('opportunity-1', 'user-2', { stage: 'SCREENING' }),
    ).rejects.toThrow(new ForbiddenException('You do not manage this company'));

    expect(pipelineRepository.append).not.toHaveBeenCalled();
  });

  it('throws when the opportunity does not exist', async () => {
    opportunityRepository.findById.mockResolvedValue(undefined);

    await expect(service.appendStage('missing', 'user-1', { stage: 'SCREENING' })).rejects.toThrow(
      new NotFoundException('Opportunity not found'),
    );
  });
});
