import { Module } from '@nestjs/common';

import { CompanyModule } from '../companies/company.module';
import { ProfessionalProfileModule } from '../professionals/professional-profile.module';
import { JobController } from './jobs/job.controller';
import { JobLookupController } from './jobs/job-lookup.controller';
import { JobRepository } from './jobs/job.repository';
import { JobService } from './jobs/job.service';
import { JobOpportunityController } from './opportunities/job-opportunity.controller';
import { MyOpportunityController } from './opportunities/my-opportunity.controller';
import { OpportunityController } from './opportunities/opportunity.controller';
import { OpportunityRepository } from './opportunities/opportunity.repository';
import { OpportunityService } from './opportunities/opportunity.service';
import { HiringPipelineController } from './pipeline/hiring-pipeline.controller';
import { HiringPipelineRepository } from './pipeline/hiring-pipeline.repository';
import { HiringPipelineService } from './pipeline/hiring-pipeline.service';

@Module({
  imports: [CompanyModule, ProfessionalProfileModule],
  controllers: [
    JobController,
    JobLookupController,
    JobOpportunityController,
    MyOpportunityController,
    OpportunityController,
    HiringPipelineController,
  ],
  providers: [
    JobRepository,
    JobService,
    OpportunityRepository,
    OpportunityService,
    HiringPipelineRepository,
    HiringPipelineService,
  ],
})
export class HiringModule {}
