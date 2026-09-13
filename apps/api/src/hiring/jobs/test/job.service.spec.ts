import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { JobService } from '../job.service';

describe('JobService', () => {
  const jobRepository = {
    create: jest.fn(),
    listByCompany: jest.fn(),
    findById: jest.fn(),
    findByIdForCompany: jest.fn(),
    updateById: jest.fn(),
    expirePendingOpportunities: jest.fn(),
  };

  const companyRepository = {
    findById: jest.fn(),
    isAdmin: jest.fn(),
  };

  const service = new JobService(jobRepository as never, companyRepository as never);

  const dto = {
    title: 'Senior Engineer',
    description: 'A'.repeat(30),
    employmentType: 'FULL_TIME' as const,
    workMode: 'REMOTE' as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a job when the user manages the company', async () => {
    companyRepository.findById.mockResolvedValue({ id: 'company-1' });
    companyRepository.isAdmin.mockResolvedValue(true);

    const created = { id: 'job-1', ...dto };
    jobRepository.create.mockResolvedValue(created);

    await expect(service.createJob('company-1', 'user-1', dto)).resolves.toEqual(created);
  });

  it('throws when a non-admin tries to create a job', async () => {
    companyRepository.findById.mockResolvedValue({ id: 'company-1' });
    companyRepository.isAdmin.mockResolvedValue(false);

    await expect(service.createJob('company-1', 'user-2', dto)).rejects.toThrow(
      new ForbiddenException('You do not manage this company'),
    );

    expect(jobRepository.create).not.toHaveBeenCalled();
  });

  it('lists jobs for an existing company', async () => {
    companyRepository.findById.mockResolvedValue({ id: 'company-1' });
    const jobs = [{ id: 'job-1' }];
    jobRepository.listByCompany.mockResolvedValue(jobs);

    await expect(service.listJobs('company-1')).resolves.toEqual(jobs);
  });

  it('returns a job by id', async () => {
    const job = { id: 'job-1' };
    jobRepository.findById.mockResolvedValue(job);

    await expect(service.getJob('job-1')).resolves.toEqual(job);
  });

  it('throws when the job does not exist', async () => {
    jobRepository.findById.mockResolvedValue(undefined);

    await expect(service.getJob('missing')).rejects.toThrow(new NotFoundException('Job not found'));
  });

  it('updates a job and does not expire opportunities when still active', async () => {
    companyRepository.findById.mockResolvedValue({ id: 'company-1' });
    companyRepository.isAdmin.mockResolvedValue(true);
    jobRepository.findByIdForCompany.mockResolvedValue({ id: 'job-1' });

    const updated = { id: 'job-1', status: 'ACTIVE', title: 'Updated' };
    jobRepository.updateById.mockResolvedValue(updated);

    await expect(
      service.updateJob('company-1', 'job-1', 'user-1', { title: 'Updated' }),
    ).resolves.toEqual(updated);
    expect(jobRepository.expirePendingOpportunities).not.toHaveBeenCalled();
  });

  it('expires pending opportunities when a job is closed', async () => {
    companyRepository.findById.mockResolvedValue({ id: 'company-1' });
    companyRepository.isAdmin.mockResolvedValue(true);
    jobRepository.findByIdForCompany.mockResolvedValue({ id: 'job-1' });

    const updated = { id: 'job-1', status: 'CLOSED' };
    jobRepository.updateById.mockResolvedValue(updated);

    await service.updateJob('company-1', 'job-1', 'user-1', { status: 'CLOSED' });

    expect(jobRepository.expirePendingOpportunities).toHaveBeenCalledWith('job-1');
  });

  it('throws when updating a job that does not exist', async () => {
    companyRepository.findById.mockResolvedValue({ id: 'company-1' });
    companyRepository.isAdmin.mockResolvedValue(true);
    jobRepository.findByIdForCompany.mockResolvedValue(undefined);

    await expect(
      service.updateJob('company-1', 'missing', 'user-1', { title: 'Updated' }),
    ).rejects.toThrow(new NotFoundException('Job not found'));
  });
});
