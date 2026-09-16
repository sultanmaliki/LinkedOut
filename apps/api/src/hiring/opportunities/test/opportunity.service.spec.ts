import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';

import { OpportunityService } from '../opportunity.service';

describe('OpportunityService', () => {
  const opportunityRepository = {
    existsActiveForJobAndProfile: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    listByProfessional: jest.fn(),
    listByJob: jest.fn(),
    listByCompanyId: jest.fn(),
    respond: jest.fn(),
    withdraw: jest.fn(),
    getContactMethods: jest.fn(),
    setManuallyFlaggedUnresponsive: jest.fn(),
  };

  const jobRepository = {
    findById: jest.fn(),
    findByIds: jest.fn(),
  };

  const companyRepository = {
    isAdmin: jest.fn(),
    findById: jest.fn(),
    findByIds: jest.fn(),
  };

  const profileRepository = {
    findByUserId: jest.fn(),
    findById: jest.fn(),
  };

  const pipelineRepository = {
    listByOpportunity: jest.fn(),
    append: jest.fn(),
  };

  const pipelineStatusService = {
    decorate: jest.fn(),
  };

  const service = new OpportunityService(
    opportunityRepository as never,
    jobRepository as never,
    companyRepository as never,
    profileRepository as never,
    pipelineRepository as never,
    pipelineStatusService as never,
  );

  const dummyDisplayStatus = {
    stage: 'SENT',
    ownedBy: null,
    deadline: null,
    tier: 'onTime',
    daysRemaining: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jobRepository.findByIds.mockResolvedValue([]);
    companyRepository.findByIds.mockResolvedValue([]);
    pipelineStatusService.decorate.mockImplementation(async (opportunities: unknown[]) =>
      opportunities.map((o) => ({ ...(o as object), displayStatus: dummyDisplayStatus })),
    );
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

  describe('listByCompany', () => {
    it('lists opportunities for a company the user manages', async () => {
      companyRepository.isAdmin.mockResolvedValue(true);
      companyRepository.findById.mockResolvedValue({ id: 'company-1' });
      const opportunities = [{ id: 'opportunity-1' }];
      opportunityRepository.listByCompanyId.mockResolvedValue(opportunities);

      const result = await service.listByCompany('company-1', 'user-1');

      expect(result).toEqual([{ id: 'opportunity-1', displayStatus: dummyDisplayStatus }]);
      expect(opportunityRepository.listByCompanyId).toHaveBeenCalledWith('company-1');
    });

    it('throws when the user does not manage the company', async () => {
      companyRepository.isAdmin.mockResolvedValue(false);

      await expect(service.listByCompany('company-1', 'user-2')).rejects.toThrow(
        new ForbiddenException('You do not manage this company'),
      );
    });
  });

  describe('getContactMethods', () => {
    it('returns contact methods for a user with access', async () => {
      opportunityRepository.findById.mockResolvedValue({
        id: 'opportunity-1',
        professionalProfileId: 'profile-1',
        jobId: 'job-1',
      });
      profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
      const methods = [{ id: 'cm-1', type: 'EMAIL', value: 'a@example.com' }];
      opportunityRepository.getContactMethods.mockResolvedValue(methods);

      await expect(service.getContactMethods('opportunity-1', 'user-1')).resolves.toEqual(methods);
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

      await expect(service.getContactMethods('opportunity-1', 'user-3')).rejects.toThrow(
        new ForbiddenException('You do not have access to this opportunity'),
      );
    });
  });

  describe('respondToOffer', () => {
    it('appends OFFER_ACCEPTED when the professional accepts a released offer', async () => {
      profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
      opportunityRepository.findById.mockResolvedValue({
        id: 'opportunity-1',
        professionalProfileId: 'profile-1',
        jobId: 'job-1',
      });
      pipelineRepository.listByOpportunity.mockResolvedValue([
        { stage: 'SENT' },
        { stage: 'ACCEPTED' },
        { stage: 'OFFER_RELEASED' },
      ]);

      await service.respondToOffer('opportunity-1', 'user-1', true);

      expect(pipelineRepository.append).toHaveBeenCalledWith('opportunity-1', {
        stage: 'OFFER_ACCEPTED',
      });
    });

    it('appends DECLINED when the professional declines a released offer', async () => {
      profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
      opportunityRepository.findById.mockResolvedValue({
        id: 'opportunity-1',
        professionalProfileId: 'profile-1',
        jobId: 'job-1',
      });
      pipelineRepository.listByOpportunity.mockResolvedValue([{ stage: 'OFFER_RELEASED' }]);

      await service.respondToOffer('opportunity-1', 'user-1', false);

      expect(pipelineRepository.append).toHaveBeenCalledWith('opportunity-1', {
        stage: 'DECLINED',
      });
    });

    it('throws when there is no active offer', async () => {
      profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
      opportunityRepository.findById.mockResolvedValue({
        id: 'opportunity-1',
        professionalProfileId: 'profile-1',
        jobId: 'job-1',
      });
      pipelineRepository.listByOpportunity.mockResolvedValue([{ stage: 'REVIEWING' }]);

      await expect(service.respondToOffer('opportunity-1', 'user-1', true)).rejects.toThrow(
        new ConflictException('This opportunity does not currently have an active offer'),
      );
      expect(pipelineRepository.append).not.toHaveBeenCalled();
    });
  });

  describe('flagUnresponsive', () => {
    it('flags an opportunity once it is past its response window', async () => {
      profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
      const opportunity = {
        id: 'opportunity-1',
        professionalProfileId: 'profile-1',
        jobId: 'job-1',
      };
      opportunityRepository.findById.mockResolvedValue(opportunity);
      pipelineStatusService.decorate.mockResolvedValueOnce([
        {
          ...opportunity,
          displayStatus: { ...dummyDisplayStatus, ownedBy: 'company', tier: 'softFlag' },
        },
      ]);
      const flagged = { ...opportunity, manuallyFlaggedUnresponsiveAt: new Date() };
      opportunityRepository.setManuallyFlaggedUnresponsive.mockResolvedValue(flagged);

      await service.flagUnresponsive('opportunity-1', 'user-1');

      expect(opportunityRepository.setManuallyFlaggedUnresponsive).toHaveBeenCalledWith(
        'opportunity-1',
      );
    });

    it('throws when the opportunity is not currently company-owned', async () => {
      profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
      const opportunity = {
        id: 'opportunity-1',
        professionalProfileId: 'profile-1',
        jobId: 'job-1',
      };
      opportunityRepository.findById.mockResolvedValue(opportunity);
      pipelineStatusService.decorate.mockResolvedValueOnce([
        { ...opportunity, displayStatus: { ...dummyDisplayStatus, ownedBy: 'professional' } },
      ]);

      await expect(service.flagUnresponsive('opportunity-1', 'user-1')).rejects.toThrow(
        new ConflictException('This opportunity is not currently waiting on the company'),
      );
    });

    it('throws when the response window has not yet elapsed', async () => {
      profileRepository.findByUserId.mockResolvedValue({ id: 'profile-1' });
      const opportunity = {
        id: 'opportunity-1',
        professionalProfileId: 'profile-1',
        jobId: 'job-1',
      };
      opportunityRepository.findById.mockResolvedValue(opportunity);
      pipelineStatusService.decorate.mockResolvedValueOnce([
        {
          ...opportunity,
          displayStatus: { ...dummyDisplayStatus, ownedBy: 'company', tier: 'onTime' },
        },
      ]);

      await expect(service.flagUnresponsive('opportunity-1', 'user-1')).rejects.toThrow(
        new ConflictException('This opportunity has not yet passed its response window'),
      );
    });
  });
});
