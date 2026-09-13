import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';

import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthGuard, AuthenticatedUser } from '../../auth/guards/auth.guard';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobService } from './job.service';

@Controller('companies/:companyId/jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Get()
  async listJobs(@Param('companyId') companyId: string) {
    return this.jobService.listJobs(companyId);
  }

  @Post()
  @UseGuards(AuthGuard)
  async createJob(
    @Param('companyId') companyId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateJobDto,
  ) {
    return this.jobService.createJob(companyId, user.id, dto);
  }

  @Patch(':jobId')
  @UseGuards(AuthGuard)
  async updateJob(
    @Param('companyId') companyId: string,
    @Param('jobId') jobId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateJobDto,
  ) {
    return this.jobService.updateJob(companyId, jobId, user.id, dto);
  }
}
