import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CompanyRepository } from '../../companies/company.repository';
import { ProfessionalProfileRepository } from '../../professionals/professional-profile.repository';
import { JobRepository } from '../jobs/job.repository';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { RespondToOpportunityDto } from './dto/respond-to-opportunity.dto';
import { OpportunityRecord, OpportunityRepository } from './opportunity.repository';

const WITHDRAW_WINDOW_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class OpportunityService {
  constructor(
    private readonly opportunityRepository: OpportunityRepository,
    private readonly jobRepository: JobRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly profileRepository: ProfessionalProfileRepository,
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

  async getOpportunity(opportunityId: string, userId: string): Promise<OpportunityRecord> {
    return this.requireAccess(opportunityId, userId);
  }

  async listMyOpportunities(userId: string): Promise<OpportunityRecord[]> {
    const profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      throw new NotFoundException('Professional profile not found');
    }

    return this.opportunityRepository.listByProfessional(profile.id);
  }

  async listByJob(jobId: string, userId: string): Promise<OpportunityRecord[]> {
    const job = await this.jobRepository.findById(jobId);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const isAdmin = await this.companyRepository.isAdmin(job.companyId, userId);

    if (!isAdmin) {
      throw new ForbiddenException('You do not manage this company');
    }

    return this.opportunityRepository.listByJob(jobId);
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
