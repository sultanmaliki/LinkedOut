import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';

import { OpportunityService } from '../opportunity.service';

describe('OpportunityService', () => {
  const opportunityRepository = {
    existsActiveForJobAndProfile: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    listByProfessional: jest.fn(),
    listByJob: jest.fn(),
    respond: jest.fn(),
    withdraw: jest.fn(),
  };

  const jobRepository = {
    findById: jest.fn(),
  };

  const companyRepository = {
    isAdmin: jest.fn(),
    findById: jest.fn(),
  };

  const profileRepository = {
    findByUserId: jest.fn(),
    findById: jest.fn(),
  };

  const service = new OpportunityService(
    opportunityRepository as never,
    jobRepository as never,
    companyRepository as never,
    profileRepository as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createOpportunity', () => {
    const dto = { professionalProfileId: 'profile-1' };

    it('creates an opportunity for an active job', async () => {
      jobRepository.findById.mockResolvedValue({
        id: 'job-1',
        companyId: 'company-1',
        status: 'ACTIVE',
      });
      companyRepository.isAdmin.mockResolvedValue(true);
      profileRepository.findById.mockResolvedValue({ id: 'profile-1' });
      opportunityRepository.existsActiveForJobAndProfile.mockResolvedValue(false);
      companyRepository.findById.mockResolvedValue({ id: 'company-1', displayName: 'Acme' });

      const created = { id: 'opportunity-1' };
      opportunityRepository.create.mockResolvedValue(created);

      await expect(service.createOpportunity('job-1', 'user-1', dto)).resolves.toEqual(created);
    });

    it('throws when the user does not manage the job company', async () => {
      jobRepository.findById.mockResolvedValue({
        id: 'job-1',
        companyId: 'company-1',
        status: 'ACTIVE',
      });
      companyRepository.isAdmin.mockResolvedValue(false);

      await expect(service.createOpportunity('job-1', 'user-2', dto)).rejects.toThrow(
        new ForbiddenException('You do not manage this company'),
      );
    });

    it('throws when the job is not active', async () => {
      jobRepository.findById.mockResolvedValue({
        id: 'job-1',
        companyId: 'company-1',
        status: 'CLOSED',
      });
      companyRepository.isAdmin.mockResolvedValue(true);

      await expect(service.createOpportunity('job-1', 'user-1', dto)).rejects.toThrow(
        new ConflictException('This job is not currently active'),
      );
    });

    it('throws when a pending opportunity already exists', async () => {
      jobRepository.findById.mockResolvedValue({
        id: 'job-1',
        companyId: 'company-1',
        status: 'ACTIVE',
      });
      companyRepository.isAdmin.mockResolvedValue(true);
      profileRepository.findById.mockResolvedValue({ id: 'profile-1' });
      opportunityRepository.existsActiveForJobAndProfile.mockResolvedValue(true);

      await expect(service.createOpportunity('job-1', 'user-1', dto)).rejects.toThrow(
        new ConflictException('A pending opportunity already exists for this professional and job'),
      );
    });
  });

  describe('respond', () => {
    it('accepts an opportunity with a contact method', async () => {
      profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
      opportunityRepository.findById.mockResolvedValue({
        id: 'opportunity-1',
        professionalProfileId: 'profile-1',
        status: 'PENDING',
        jobId: 'job-1',
      });
      jobRepository.findById.mockResolvedValue({ id: 'job-1', status: 'ACTIVE' });

      const updated = { id: 'opportunity-1', status: 'ACCEPTED' };
      opportunityRepository.respond.mockResolvedValue({ opportunity: updated, response: {} });

      await expect(
        service.respond('opportunity-1', 'user-1', {
          accepted: true,
          contactMethods: [{ type: 'EMAIL', value: 'ada@example.com' }],
        }),
      ).resolves.toEqual(updated);
    });

    it('throws when accepting without a contact method', async () => {
      profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
      opportunityRepository.findById.mockResolvedValue({
        id: 'opportunity-1',
        professionalProfileId: 'profile-1',
        status: 'PENDING',
        jobId: 'job-1',
      });
      jobRepository.findById.mockResolvedValue({ id: 'job-1', status: 'ACTIVE' });

      await expect(service.respond('opportunity-1', 'user-1', { accepted: true })).rejects.toThrow(
        new ConflictException('At least one contact method is required to accept an opportunity'),
      );
    });

    it('throws when the opportunity was already responded to', async () => {
      profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
      opportunityRepository.findById.mockResolvedValue({
        id: 'opportunity-1',
        professionalProfileId: 'profile-1',
        status: 'ACCEPTED',
        jobId: 'job-1',
      });

      await expect(service.respond('opportunity-1', 'user-1', { accepted: false })).rejects.toThrow(
        new ConflictException('This opportunity has already been responded to'),
      );
    });

    it('throws when the job is no longer active', async () => {
      profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
      opportunityRepository.findById.mockResolvedValue({
        id: 'opportunity-1',
        professionalProfileId: 'profile-1',
        status: 'PENDING',
        jobId: 'job-1',
      });
      jobRepository.findById.mockResolvedValue({ id: 'job-1', status: 'CLOSED' });

      await expect(service.respond('opportunity-1', 'user-1', { accepted: false })).rejects.toThrow(
        new ConflictException('This opportunity has expired because the job is no longer active'),
      );
    });

    it('throws when the opportunity does not belong to the user', async () => {
      profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
      opportunityRepository.findById.mockResolvedValue({
        id: 'opportunity-1',
        professionalProfileId: 'profile-2',
        status: 'PENDING',
      });

      await expect(service.respond('opportunity-1', 'user-1', { accepted: false })).rejects.toThrow(
        new NotFoundException('Opportunity not found'),
      );
    });
  });

  describe('withdraw', () => {
    it('withdraws an opportunity accepted within the last 24 hours', async () => {
      profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
      opportunityRepository.findById.mockResolvedValue({
        id: 'opportunity-1',
        professionalProfileId: 'profile-1',
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      });

      const withdrawn = { id: 'opportunity-1', status: 'WITHDRAWN' };
      opportunityRepository.withdraw.mockResolvedValue(withdrawn);

      await expect(service.withdraw('opportunity-1', 'user-1')).resolves.toEqual(withdrawn);
    });

    it('throws when the 24-hour window has passed', async () => {
      profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
      opportunityRepository.findById.mockResolvedValue({
        id: 'opportunity-1',
        professionalProfileId: 'profile-1',
        status: 'ACCEPTED',
        acceptedAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
      });

      await expect(service.withdraw('opportunity-1', 'user-1')).rejects.toThrow(
        new ForbiddenException('The 24-hour withdrawal window has passed'),
      );
    });

    it('throws when the opportunity was never accepted', async () => {
      profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
      opportunityRepository.findById.mockResolvedValue({
        id: 'opportunity-1',
        professionalProfileId: 'profile-1',
        status: 'PENDING',
        acceptedAt: null,
      });

      await expect(service.withdraw('opportunity-1', 'user-1')).rejects.toThrow(
        new ConflictException('Only an accepted opportunity can be withdrawn'),
      );
    });
  });

  describe('access', () => {
    it('allows the owning professional to view an opportunity', async () => {
      opportunityRepository.findById.mockResolvedValue({
        id: 'opportunity-1',
        professionalProfileId: 'profile-1',
        jobId: 'job-1',
      });
      profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });

      await expect(service.getOpportunity('opportunity-1', 'user-1')).resolves.toMatchObject({
        id: 'opportunity-1',
      });
    });

    it('allows the managing company admin to view an opportunity', async () => {
      opportunityRepository.findById.mockResolvedValue({
        id: 'opportunity-1',
        professionalProfileId: 'profile-1',
        jobId: 'job-1',
      });
      profileRepository.findByUserId.mockResolvedValue({ id: 'profile-2' });
      jobRepository.findById.mockResolvedValue({ id: 'job-1', companyId: 'company-1' });
      companyRepository.isAdmin.mockResolvedValue(true);

      await expect(service.getOpportunity('opportunity-1', 'user-2')).resolves.toMatchObject({
        id: 'opportunity-1',
      });
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

      await expect(service.getOpportunity('opportunity-1', 'user-3')).rejects.toThrow(
        new ForbiddenException('You do not have access to this opportunity'),
      );
    });
  });
});
