import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticatedUser } from '../../../auth/guards/auth.guard';
import { JobController } from '../job.controller';
import { JobService } from '../job.service';

describe('JobController', () => {
  let controller: JobController;

  const jobService = {
    listJobs: jest.fn(),
    createJob: jest.fn(),
    updateJob: jest.fn(),
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
      controllers: [JobController],
      providers: [{ provide: JobService, useValue: jobService }],
    }).compile();

    controller = module.get<JobController>(JobController);
  });

  it('lists jobs for a company', async () => {
    const jobs = [{ id: 'job-1' }];
    jobService.listJobs.mockResolvedValue(jobs);

    await expect(controller.listJobs('company-1')).resolves.toEqual(jobs);
    expect(jobService.listJobs).toHaveBeenCalledWith('company-1');
  });

  it('creates a job for the authenticated user', async () => {
    const dto = {
      title: 'Senior Engineer',
      description: 'A'.repeat(30),
      employmentType: 'FULL_TIME' as const,
      workMode: 'REMOTE' as const,
    };
    const created = { id: 'job-1', ...dto };
    jobService.createJob.mockResolvedValue(created);

    await expect(controller.createJob('company-1', user, dto)).resolves.toEqual(created);
    expect(jobService.createJob).toHaveBeenCalledWith('company-1', 'user-1', dto);
  });

  it('updates a job for the authenticated user', async () => {
    const dto = { title: 'Updated' };
    const updated = { id: 'job-1', ...dto };
    jobService.updateJob.mockResolvedValue(updated);

    await expect(controller.updateJob('company-1', 'job-1', user, dto)).resolves.toEqual(updated);
    expect(jobService.updateJob).toHaveBeenCalledWith('company-1', 'job-1', 'user-1', dto);
  });
});
