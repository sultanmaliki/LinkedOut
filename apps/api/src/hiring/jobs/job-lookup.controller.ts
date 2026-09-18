import { Controller, Get, Param } from '@nestjs/common';

import { PublicCache } from '../../common/decorators/public-cache.decorator';
import { JobService } from './job.service';

@Controller('jobs')
export class JobLookupController {
  constructor(private readonly jobService: JobService) {}

  @PublicCache()
  @Get(':jobId')
  async getJob(@Param('jobId') jobId: string) {
    return this.jobService.getJob(jobId);
  }
}
