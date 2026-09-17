import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { CompanyRepository } from '../../companies/company.repository';
import { ProfessionalProfileRepository } from '../../professionals/professional-profile.repository';
import { JobRepository } from '../jobs/job.repository';
import { OpportunityRepository } from '../opportunities/opportunity.repository';
import { AppendPipelineStageDto } from './dto/append-pipeline-stage.dto';
import { HiringPipelineRecord, HiringPipelineRepository } from './hiring-pipeline.repository';

const TERMINAL_STAGES = new Set(['OFFER_ACCEPTED', 'DECLINED', 'REJECTED', 'WITHDRAWN']);

@Injectable()
export class HiringPipelineService {
  constructor(
    private readonly pipelineRepository: HiringPipelineRepository,
    private readonly opportunityRepository: OpportunityRepository,
    private readonly jobRepository: JobRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly profileRepository: ProfessionalProfileRepository,
  ) {}

  async listStages(opportunityId: string, userId: string): Promise<HiringPipelineRecord[]> {
    await this.requireAccess(opportunityId, userId);

    return this.pipelineRepository.listByOpportunity(opportunityId);
  }

  async appendStage(
    opportunityId: string,
    userId: string,
    dto: AppendPipelineStageDto,
  ): Promise<HiringPipelineRecord> {
    const opportunity = await this.opportunityRepository.findById(opportunityId);

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    const job = await this.jobRepository.findById(opportunity.jobId);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const isAdmin = await this.companyRepository.isAdmin(job.companyId, userId);

    if (!isAdmin) {
      throw new ForbiddenException('You do not manage this company');
    }

    const stages = await this.pipelineRepository.listByOpportunity(opportunityId);
    const latest = stages[stages.length - 1];

    if (latest && TERMINAL_STAGES.has(latest.stage)) {
      throw new ConflictException('This opportunity has already reached a final stage');
    }

    return this.pipelineRepository.append(opportunityId, {
      stage: dto.stage,
      notes: dto.notes,
      scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
      windowDays: dto.windowDays,
    });
  }

  private async requireAccess(opportunityId: string, userId: string): Promise<void> {
    const opportunity = await this.opportunityRepository.findById(opportunityId);

    if (!opportunity) {
      throw new NotFoundException('Opportunity not found');
    }

    const profile = await this.profileRepository.findByUserId(userId);

    if (profile?.id === opportunity.professionalProfileId) {
      return;
    }

    const job = await this.jobRepository.findById(opportunity.jobId);
    const isAdmin = job ? await this.companyRepository.isAdmin(job.companyId, userId) : false;

    if (!isAdmin) {
      throw new ForbiddenException('You do not have access to this opportunity');
    }
  }
}
