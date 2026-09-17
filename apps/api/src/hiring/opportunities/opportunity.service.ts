import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CompanyRecord, CompanyRepository } from '../../companies/company.repository';
import { ProfessionalProfileRepository } from '../../professionals/professional-profile.repository';
import { JobRepository } from '../jobs/job.repository';
import { HiringPipelineRepository, PipelineStage } from '../pipeline/hiring-pipeline.repository';
import { PipelineStatusService, WithDisplayStatus } from '../pipeline/pipeline-status.service';
import {
  ContactMethodRecord,
  OpportunityRecord,
  OpportunityRepository,
  OpportunityWithJobAndProfessional,
  OpportunityWithProfessionalName,
} from './opportunity.repository';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { RespondToOpportunityDto } from './dto/respond-to-opportunity.dto';

const WITHDRAW_WINDOW_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class OpportunityService {
  constructor(
    private readonly opportunityRepository: OpportunityRepository,
    private readonly jobRepository: JobRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly profileRepository: ProfessionalProfileRepository,
    private readonly pipelineRepository: HiringPipelineRepository,
    private readonly pipelineStatusService: PipelineStatusService,
  ) {}

  async createOpportunity(
    jobId: string,
    userId: string,
    dto: CreateOpportunityDto,
  ): Promise<OpportunityRecord> {
    const job = await this.jobRepository.findById(jobId);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const isAdmin = await this.companyRepository.isAdmin(job.companyId, userId);

    if (!isAdmin) {
      throw new ForbiddenException('You do not manage this company');
    }

    if (job.status !== 'ACTIVE') {
      throw new ConflictException('This job is not currently active');
    }

    const targetProfile = await this.profileRepository.findById(dto.professionalProfileId);

    if (!targetProfile) {
      throw new NotFoundException('Professional profile not found');
    }

    const alreadyPending = await this.opportunityRepository.existsActiveForJobAndProfile(
      jobId,
      dto.professionalProfileId,
    );

    if (alreadyPending) {
      throw new ConflictException(
        'A pending opportunity already exists for this professional and job',
      );
    }

    const company = await this.companyRepository.findById(job.companyId);

    return this.opportunityRepository.create(
      {
        jobId,
        professionalProfileId: dto.professionalProfileId,
        message: dto.message,
        responseWindowDays: dto.responseWindowDays,
      },
      {
        job: {
          id: job.id,
          title: job.title,
          employmentType: job.employmentType,
          workMode: job.workMode,
        },
        company: company ? { id: company.id, displayName: company.displayName } : null,
      },
    );
  }

  async getOpportunity(
    opportunityId: string,
    userId: string,
  ): Promise<WithDisplayStatus<OpportunityRecord>> {
    const opportunity = await this.requireAccess(opportunityId, userId);
    const job = await this.jobRepository.findById(opportunity.jobId);
    const company = job ? await this.companyRepository.findById(job.companyId) : undefined;

    const [decorated] = await this.pipelineStatusService.decorate(
      [opportunity],
      new Map([[opportunity.id, company]]),
    );

    return decorated;
  }

  async listMyOpportunities(userId: string): Promise<WithDisplayStatus<OpportunityRecord>[]> {
    const profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException('Professional profile not found');
    }

    const opportunities = await this.opportunityRepository.listByProfessional(profile.id);
    const companiesById = await this.resolveCompaniesForOpportunities(opportunities);

    return this.pipelineStatusService.decorate(opportunities, companiesById);
  }

  async listByJob(
    jobId: string,
    userId: string,
  ): Promise<WithDisplayStatus<OpportunityWithProfessionalName>[]> {
    const job = await this.jobRepository.findById(jobId);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const isAdmin = await this.companyRepository.isAdmin(job.companyId, userId);

    if (!isAdmin) {
      throw new ForbiddenException('You do not manage this company');
    }

    const opportunities = await this.opportunityRepository.listByJob(jobId);
    const company = await this.companyRepository.findById(job.companyId);
    const companiesById = new Map(opportunities.map((o) => [o.id, company]));

    return this.pipelineStatusService.decorate(opportunities, companiesById);
  }

  async listByCompany(
    companyId: string,
    userId: string,
  ): Promise<WithDisplayStatus<OpportunityWithJobAndProfessional>[]> {
    const isAdmin = await this.companyRepository.isAdmin(companyId, userId);

    if (!isAdmin) {
      throw new ForbiddenException('You do not manage this company');
    }

    const opportunities = await this.opportunityRepository.listByCompanyId(companyId);
    const company = await this.companyRepository.findById(companyId);
    const companiesById = new Map(opportunities.map((o) => [o.id, company]));

    return this.pipelineStatusService.decorate(opportunities, companiesById);
  }

  async respond(
    opportunityId: string,
    userId: string,
    dto: RespondToOpportunityDto,
  ): Promise<OpportunityRecord> {
    const profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException('Professional profile not found');
    }

    const opportunity = await this.opportunityRepository.findById(opportunityId);

    if (!opportunity || opportunity.professionalProfileId !== profile.id) {
      throw new NotFoundException('Opportunity not found');
    }

    if (opportunity.status !== 'PENDING') {
      throw new ConflictException('This opportunity has already been responded to');
    }

    const job = await this.jobRepository.findById(opportunity.jobId);

    if (job && job.status !== 'ACTIVE') {
      throw new ConflictException(
        'This opportunity has expired because the job is no longer active',
      );
    }

    if (dto.accepted && (!dto.contactMethods || dto.contactMethods.length === 0)) {
      throw new ConflictException(
        'At least one contact method is required to accept an opportunity',
      );
    }

    const { opportunity: updated } = await this.opportunityRepository.respond(opportunityId, {
      accepted: dto.accepted,
      message: dto.message,
      contactMethods: dto.contactMethods,
    });

    return updated;
  }

  async withdraw(opportunityId: string, userId: string): Promise<OpportunityRecord> {
    const profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException('Professional profile not found');
    }

    const opportunity = await this.opportunityRepository.findById(opportunityId);

    if (!opportunity || opportunity.professionalProfileId !== profile.id) {
      throw new NotFoundException('Opportunity not found');
    }

    if (opportunity.status !== 'ACCEPTED' || !opportunity.acceptedAt) {
      throw new ConflictException('Only an accepted opportunity can be withdrawn');
    }

    const elapsed = Date.now() - new Date(opportunity.acceptedAt).getTime();

    if (elapsed > WITHDRAW_WINDOW_MS) {
      throw new ForbiddenException('The 24-hour withdrawal window has passed');
    }

    const updated = await this.opportunityRepository.withdraw(opportunityId);

    if (!updated) {
      throw new NotFoundException('Opportunity not found');
    }

    return updated;
  }

  async getContactMethods(opportunityId: string, userId: string): Promise<ContactMethodRecord[]> {
    await this.requireAccess(opportunityId, userId);

    return this.opportunityRepository.getContactMethods(opportunityId);
  }

  async respondToOffer(
    opportunityId: string,
    userId: string,
    accepted: boolean,
  ): Promise<WithDisplayStatus<OpportunityRecord>> {
    const profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException('Professional profile not found');
    }

    const opportunity = await this.opportunityRepository.findById(opportunityId);

    if (!opportunity || opportunity.professionalProfileId !== profile.id) {
      throw new NotFoundException('Opportunity not found');
    }

    const latest = await this.latestStage(opportunityId);

    if (!latest || latest.stage !== 'OFFER_RELEASED') {
      throw new ConflictException('This opportunity does not currently have an active offer');
    }

    await this.pipelineRepository.append(opportunityId, {
      stage: accepted ? 'OFFER_ACCEPTED' : 'DECLINED',
    });

    const job = await this.jobRepository.findById(opportunity.jobId);
    const company = job ? await this.companyRepository.findById(job.companyId) : undefined;

    const [decorated] = await this.pipelineStatusService.decorate(
      [opportunity],
      new Map([[opportunity.id, company]]),
    );

    return decorated;
  }

  async flagUnresponsive(
    opportunityId: string,
    userId: string,
  ): Promise<WithDisplayStatus<OpportunityRecord>> {
    const profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException('Professional profile not found');
    }

    const opportunity = await this.opportunityRepository.findById(opportunityId);

    if (!opportunity || opportunity.professionalProfileId !== profile.id) {
      throw new NotFoundException('Opportunity not found');
    }

    const job = await this.jobRepository.findById(opportunity.jobId);
    const company = job ? await this.companyRepository.findById(job.companyId) : undefined;

    const [currentStatus] = await this.pipelineStatusService.decorate(
      [opportunity],
      new Map([[opportunity.id, company]]),
    );

    if (currentStatus.displayStatus.ownedBy !== 'company') {
      throw new ConflictException('This opportunity is not currently waiting on the company');
    }

    if (currentStatus.displayStatus.tier === 'onTime') {
      throw new ConflictException('This opportunity has not yet passed its response window');
    }

    const updated = await this.opportunityRepository.setManuallyFlaggedUnresponsive(opportunityId);

    if (!updated) {
      throw new NotFoundException('Opportunity not found');
    }

    const [decorated] = await this.pipelineStatusService.decorate(
      [updated],
      new Map([[updated.id, company]]),
    );

    return decorated;
  }

  private async latestStage(opportunityId: string): Promise<{ stage: PipelineStage } | undefined> {
    const stages = await this.pipelineRepository.listByOpportunity(opportunityId);

    return stages[stages.length - 1];
  }

  private async resolveCompaniesForOpportunities(
    opportunities: OpportunityRecord[],
  ): Promise<Map<string, CompanyRecord | undefined>> {
    if (opportunities.length === 0) {
      return new Map();
    }

    const jobIds = [...new Set(opportunities.map((o) => o.jobId))];
    const jobs = await this.jobRepository.findByIds(jobIds);
    const companyIdByJobId = new Map(jobs.map((job) => [job.id, job.companyId]));

    const companyIds = [...new Set(jobs.map((job) => job.companyId))];
    const companies = await this.companyRepository.findByIds(companyIds);
    const companyById = new Map(companies.map((company) => [company.id, company]));

    return new Map(
      opportunities.map((opportunity) => [
        opportunity.id,
        companyById.get(companyIdByJobId.get(opportunity.jobId) ?? ''),
      ]),
    );
  }

  private async requireAccess(opportunityId: string, userId: string): Promise<OpportunityRecord> {
    const opportunity = await this.opportunityRepository.findById(opportunityId);

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    const profile = await this.profileRepository.findByUserId(userId);
    const isOwner = profile?.id === opportunity.professionalProfileId;

    if (isOwner) {
      return opportunity;
    }

    const job = await this.jobRepository.findById(opportunity.jobId);
    const isAdmin = job ? await this.companyRepository.isAdmin(job.companyId, userId) : false;

    if (!isAdmin) {
      throw new ForbiddenException('You do not have access to this opportunity');
    }

    return opportunity;
  }
}
