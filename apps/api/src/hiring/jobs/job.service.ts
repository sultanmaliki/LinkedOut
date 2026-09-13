import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { CompanyRepository } from '../../companies/company.repository';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobRecord, JobRepository } from './job.repository';

@Injectable()
export class JobService {
  constructor(
    private readonly jobRepository: JobRepository,
    private readonly companyRepository: CompanyRepository,
  ) {}

  async createJob(companyId: string, userId: string, dto: CreateJobDto): Promise<JobRecord> {
    await this.assertCompanyAdmin(companyId, userId);

    return this.jobRepository.create(companyId, dto);
  }

  async listJobs(companyId: string): Promise<JobRecord[]> {
    const company = await this.companyRepository.findById(companyId);

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    return this.jobRepository.listByCompany(companyId);
  }

  async getJob(jobId: string): Promise<JobRecord> {
    const job = await this.jobRepository.findById(jobId);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  async updateJob(
    companyId: string,
    jobId: string,
    userId: string,
    dto: UpdateJobDto,
  ): Promise<JobRecord> {
    await this.assertCompanyAdmin(companyId, userId);

    const existing = await this.jobRepository.findByIdForCompany(companyId, jobId);

    if (!existing) {
      throw new NotFoundException('Job not found');
    }

    const updated = await this.jobRepository.updateById(companyId, jobId, dto);

    if (!updated) {
      throw new NotFoundException('Job not found');
    }

    if (updated.status === 'CLOSED' || updated.status === 'ARCHIVED') {
      await this.jobRepository.expirePendingOpportunities(jobId);
    }

    return updated;
  }

  private async assertCompanyAdmin(companyId: string, userId: string): Promise<void> {
    const company = await this.companyRepository.findById(companyId);

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const isAdmin = await this.companyRepository.isAdmin(companyId, userId);

    if (!isAdmin) {
      throw new ForbiddenException('You do not manage this company');
    }
  }
}
